import { Router } from 'express';
import { storage } from '../storage';
import { sendContactConfirmation, sendContactResponse, sendNewsletter } from '../services/email';
import sanitizeHtml from 'sanitize-html';
import { authenticateToken, requireAdmin } from '../middleware/auth';

export const adminRoutes = Router();

adminRoutes.use(authenticateToken, requireAdmin);

adminRoutes.get('/users', async (req: any, res) => {
  try {
    const users = await storage.getAllUsers();
    const usersWithIds = users.map(user => ({
      id: user._id.toString(),
      username: user.username,
      role: user.role,
      createdAt: user.createdAt
    }));

    res.json({ users: usersWithIds });
  } catch (error) {
    console.error("Get admin users error:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
});

adminRoutes.patch('/users/:id/role', async (req: any, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await storage.updateUserRole(id, role);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id.toString(),
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

adminRoutes.delete('/users/:id', async (req: any, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const deleted = await storage.deleteUser(id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

adminRoutes.get('/contacts', async (req, res) => {
  try {
    const contacts = await storage.getAllContactSubmissions();
    console.log(`[DEBUG] Retrieved ${contacts.length} contact submissions from database`);
    const contactsWithIds = contacts.map(contact => ({
      id: contact._id.toString(),
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company,
      service: contact.service,
      message: contact.message,
      newsletter: contact.newsletter,
      status: contact.status,
      respondedAt: contact.respondedAt,
      createdAt: contact.createdAt
    }));

    console.log(`[DEBUG] Contact submissions response includes fields:`, Object.keys(contactsWithIds[0] || {}));
    res.json({ contacts: contactsWithIds });
  } catch (error) {
    console.error("Get admin contacts error:", error);
    res.status(500).json({ error: "Failed to get contacts" });
  }
});

adminRoutes.post('/contacts/:id/response', async (req: any, res) => {
  try {
    const id = req.params.id;
    const { responseMessage } = req.body;

    if (!responseMessage || !responseMessage.trim()) {
      return res.status(400).json({ error: 'Response message is required' });
    }

    const contact = await storage.getContactSubmission(id);
    if (!contact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    await sendContactResponse({
      firstName: contact.firstName,
      lastName: contact.lastName,
      email: contact.email,
      company: contact.company,
      service: contact.service,
      message: contact.message,
      newsletter: contact.newsletter,
      responseMessage: responseMessage.trim()
    });

    const updatedContact = await storage.updateContactSubmissionStatus(id, 'responded');
    if (!updatedContact) {
      return res.status(404).json({ error: "Contact submission not found" });
    }

    console.log(`[DEBUG] Successfully sent personalized response and updated contact ${id} status to responded`);

    res.json({
      success: true,
      message: 'Personalized response sent successfully',
      contact: {
        id: updatedContact._id.toString(),
        firstName: updatedContact.firstName,
        lastName: updatedContact.lastName,
        email: updatedContact.email,
        company: updatedContact.company,
        service: updatedContact.service,
        message: updatedContact.message,
        newsletter: updatedContact.newsletter,
        status: updatedContact.status,
        respondedAt: updatedContact.respondedAt,
        createdAt: updatedContact.createdAt
      }
    });
  } catch (error) {
    console.error("Send personalized contact response error:", error);
    res.status(500).json({ error: "Failed to send personalized response" });
  }
});

adminRoutes.patch('/contacts/:id/status', async (req: any, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;

    console.log(`[DEBUG] Attempting to update contact ${id} status to: ${status}`);

    if (!["pending", "responded"].includes(status)) {
      console.log(`[DEBUG] Invalid status provided: ${status}`);
      return res.status(400).json({ error: "Invalid status" });
    }

    const contact = await storage.updateContactSubmissionStatus(id, status);
    if (!contact) {
      console.log(`[DEBUG] Contact submission not found: ${id}`);
      return res.status(404).json({ error: "Contact submission not found" });
    }

    console.log(`[DEBUG] Successfully updated contact ${id} status to: ${contact.status}`);

    if (status === "responded") {
      try {
        await sendContactConfirmation({
          firstName: contact.firstName,
          lastName: contact.lastName,
          email: contact.email,
          company: contact.company,
          service: contact.service,
          message: contact.message,
          newsletter: contact.newsletter,
        });
        console.log(`✅ Confirmation email sent to ${contact.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send confirmation email to ${contact.email}:`, emailError);
      }
    }

    res.json({
      success: true,
      message: `Contact submission status updated to ${status}`,
      contact: {
        id: contact._id.toString(),
        firstName: contact.firstName,
        lastName: contact.lastName,
        email: contact.email,
        company: contact.company,
        service: contact.service,
        message: contact.message,
        newsletter: contact.newsletter,
        status: contact.status,
        respondedAt: contact.respondedAt,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({ error: "Failed to update contact submission status" });
  }
});

adminRoutes.get('/dashboard-stats', async (req: any, res) => {
  try {
    console.log(`[ADMIN DEBUG] Dashboard stats request for user ${req.user.username} with role ${req.user.role}`);
    console.log(`[ADMIN DEBUG] Admin access granted for dashboard stats`);

    const [users, consultations, contacts, blogs] = await Promise.all([
      storage.getAllUsers(),
      storage.getAllConsultationBookings(),
      storage.getAllContactSubmissions(),
      storage.getAllBlogPosts()
    ]);

    const publishedBlogs = blogs.filter(blog => blog.published);

    res.json({
      stats: {
        totalUsers: users.length,
        totalConsultations: consultations.length,
        totalContacts: contacts.length,
        totalBlogs: publishedBlogs.length
      }
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Failed to get dashboard statistics" });
  }
});

adminRoutes.get('/recent-activity', async (req, res) => {
  try {
    const [consultations, contacts, blogs] = await Promise.all([
      storage.getAllConsultationBookings(),
      storage.getAllContactSubmissions(),
      storage.getAllBlogPosts()
    ]);

    const recentConsultations = consultations
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(item => ({
        id: item._id.toString(),
        type: 'consultation',
        title: 'New consultation booking',
        description: `${item.firstName} ${item.lastName} booked a consultation`,
        timestamp: item.createdAt,
        color: 'green'
      }));

    const recentContacts = contacts
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(item => ({
        id: item._id.toString(),
        type: 'contact',
        title: 'Contact form submitted',
        description: `${item.firstName} ${item.lastName} submitted a contact form`,
        timestamp: item.createdAt,
        color: 'yellow'
      }));

    const recentBlogs = blogs
      .filter(blog => blog.published)
      .sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime())
      .slice(0, 5)
      .map(item => ({
        id: item._id.toString(),
        type: 'blog',
        title: 'Blog post published',
        description: `"${item.title}" was published`,
        timestamp: item.publishedAt || item.createdAt,
        color: 'blue'
      }));

    const allActivities = [...recentConsultations, ...recentContacts, ...recentBlogs]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    res.json({ activities: allActivities });
  } catch (error) {
    console.error("Get recent activity error:", error);
    res.status(500).json({ error: "Failed to get recent activity" });
  }
});

adminRoutes.get('/blogs', async (req, res) => {
  try {
    const blogs = await storage.getAllBlogPosts();

    const blogsWithParsedContent = blogs.map(blog => {
      const convertedBlog = {
        id: blog._id.toString(),
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: JSON.parse(blog.content),
        published: blog.published,
        publishedAt: blog.publishedAt,
        createdAt: blog.createdAt,
        authorId: blog.authorId
      };
      console.log('Converted blog ID:', convertedBlog.id, 'Original _id:', blog._id);
      return convertedBlog;
    });

    console.log('Sending blogs response with', blogsWithParsedContent.length, 'blogs');
    res.json({ blogs: blogsWithParsedContent });
  } catch (error) {
    console.error("Get admin blogs error:", error);
    res.status(500).json({ error: "Failed to get blogs" });
  }
});

adminRoutes.get('/content/pages', async (req, res) => {
  try {
    const pages = await storage.getAllStaticPages();
    const pagesWithIds = pages.map(page => ({
      id: page._id.toString(),
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt,
      published: page.published,
      publishedAt: page.publishedAt,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      authorId: page.authorId
    }));

    res.json({ pages: pagesWithIds });
  } catch (error) {
    console.error("Get admin pages error:", error);
    res.status(500).json({ error: "Failed to get pages" });
  }
});

adminRoutes.post('/content/pages', async (req: any, res) => {
  try {
    const { title, slug, content, excerpt, published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, and content are required"
      });
    }

    const page = await storage.createStaticPage({
      title,
      slug,
      content,
      excerpt: excerpt || null,
      published: published || false,
      authorId: req.user._id
    });

    res.json({
      success: true,
      message: 'Page created successfully',
      page: {
        id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        published: page.published,
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        authorId: page.authorId
      }
    });
  } catch (error) {
    console.error("Create page error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create page"
    });
  }
});

adminRoutes.put('/content/pages/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const { title, slug, content, excerpt, published } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (content !== undefined) updates.content = content;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (published !== undefined) updates.published = published;

    const page = await storage.updateStaticPage(id, updates);
    if (!page) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json({
      success: true,
      message: 'Page updated successfully',
      page: {
        id: page._id.toString(),
        title: page.title,
        slug: page.slug,
        content: page.content,
        excerpt: page.excerpt,
        published: page.published,
        publishedAt: page.publishedAt,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
        authorId: page.authorId
      }
    });
  } catch (error) {
    console.error("Update page error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update page"
    });
  }
});

adminRoutes.delete('/content/pages/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteStaticPage(id);

    if (!deleted) {
      return res.status(404).json({ error: "Page not found" });
    }

    res.json({
      success: true,
      message: 'Page deleted successfully'
    });
  } catch (error) {
    console.error("Delete page error:", error);
    res.status(500).json({ error: "Failed to delete page" });
  }
});

adminRoutes.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await storage.getAllTestimonials();
    const testimonialsWithIds = testimonials.map(testimonial => ({
      id: testimonial._id.toString(),
      name: testimonial.name,
      position: testimonial.position,
      company: testimonial.company,
      content: testimonial.content,
      rating: testimonial.rating,
      imageUrl: testimonial.imageUrl,
      published: testimonial.published,
      createdAt: testimonial.createdAt,
      updatedAt: testimonial.updatedAt
    }));

    res.json({ testimonials: testimonialsWithIds });
  } catch (error) {
    console.error("Get testimonials error:", error);
    res.status(500).json({ error: "Failed to get testimonials" });
  }
});

adminRoutes.post('/testimonials', async (req: any, res) => {
  try {
    const { name, position, company, content, rating, imageUrl, published } = req.body;

    if (!name || !content) {
      return res.status(400).json({
        success: false,
        message: "Name and content are required"
      });
    }

    const testimonial = await storage.createTestimonial({
      name,
      position: position || null,
      company: company || null,
      content,
      rating: rating || null,
      imageUrl: imageUrl || null,
      published: published || false
    });

    res.json({
      success: true,
      message: 'Testimonial created successfully',
      testimonial: {
        id: testimonial._id.toString(),
        name: testimonial.name,
        position: testimonial.position,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        imageUrl: testimonial.imageUrl,
        published: testimonial.published,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      }
    });
  } catch (error) {
    console.error("Create testimonial error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create testimonial"
    });
  }
});

adminRoutes.put('/testimonials/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const testimonial = await storage.updateTestimonial(id, updates);
    if (!testimonial) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      testimonial: {
        id: testimonial._id.toString(),
        name: testimonial.name,
        position: testimonial.position,
        company: testimonial.company,
        content: testimonial.content,
        rating: testimonial.rating,
        imageUrl: testimonial.imageUrl,
        published: testimonial.published,
        createdAt: testimonial.createdAt,
        updatedAt: testimonial.updatedAt
      }
    });
  } catch (error) {
    console.error("Update testimonial error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update testimonial"
    });
  }
});

adminRoutes.delete('/testimonials/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteTestimonial(id);

    if (!deleted) {
      return res.status(404).json({ error: "Testimonial not found" });
    }

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error("Delete testimonial error:", error);
    res.status(500).json({ error: "Failed to delete testimonial" });
  }
});

adminRoutes.get('/team', async (req, res) => {
  try {
    const members = await storage.getAllTeamMembers();
    const membersWithIds = members.map(member => ({
      id: member._id.toString(),
      name: member.name,
      position: member.position,
      bio: member.bio,
      imageUrl: member.imageUrl,
      email: member.email,
      linkedinUrl: member.linkedinUrl,
      twitterUrl: member.twitterUrl,
      facebookUrl: member.facebookUrl,
      instagramUrl: member.instagramUrl,
      websiteUrl: member.websiteUrl,
      published: member.published,
      order: member.order,
      createdAt: member.createdAt,
      updatedAt: member.updatedAt
    }));

    res.json({ members: membersWithIds });
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ error: "Failed to get team members" });
  }
});

adminRoutes.post('/team', async (req: any, res) => {
  try {
    const { name, position, bio, imageUrl, email, linkedinUrl, twitterUrl, facebookUrl, instagramUrl, websiteUrl, published, order } = req.body;

    if (!name || !position) {
      return res.status(400).json({
        success: false,
        message: "Name and position are required"
      });
    }

    const member = await storage.createTeamMember({
      name,
      position,
      bio: bio || null,
      imageUrl: imageUrl || null,
      email: email || null,
      linkedinUrl: linkedinUrl || null,
      twitterUrl: twitterUrl || null,
      facebookUrl: facebookUrl || null,
      instagramUrl: instagramUrl || null,
      websiteUrl: websiteUrl || null,
      published: published || false,
      order: order || 0
    });

    res.json({
      success: true,
      message: 'Team member created successfully',
      member: {
        id: member._id.toString(),
        name: member.name,
        position: member.position,
        bio: member.bio,
        imageUrl: member.imageUrl,
        email: member.email,
        linkedinUrl: member.linkedinUrl,
        twitterUrl: member.twitterUrl,
        facebookUrl: member.facebookUrl,
        instagramUrl: member.instagramUrl,
        websiteUrl: member.websiteUrl,
        published: member.published,
        order: member.order,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error) {
    console.error("Create team member error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create team member"
    });
  }
});

adminRoutes.put('/team/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const member = await storage.updateTeamMember(id, updates);
    if (!member) {
      return res.status(404).json({ error: "Team member not found" });
    }

    res.json({
      success: true,
      message: 'Team member updated successfully',
      member: {
        id: member._id.toString(),
        name: member.name,
        position: member.position,
        bio: member.bio,
        imageUrl: member.imageUrl,
        email: member.email,
        linkedinUrl: member.linkedinUrl,
        twitterUrl: member.twitterUrl,
        facebookUrl: member.facebookUrl,
        instagramUrl: member.instagramUrl,
        websiteUrl: member.websiteUrl,
        published: member.published,
        order: member.order,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt
      }
    });
  } catch (error) {
    console.error("Update team member error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update team member"
    });
  }
});

adminRoutes.delete('/team/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteTeamMember(id);

    if (!deleted) {
      return res.status(404).json({ error: "Team member not found" });
    }

    res.json({
      success: true,
      message: 'Team member deleted successfully'
    });
  } catch (error) {
    console.error("Delete team member error:", error);
    res.status(500).json({ error: "Failed to delete team member" });
  }
});

adminRoutes.get('/faq', async (req, res) => {
  try {
    const items = await storage.getAllFAQItems();
    const itemsWithIds = items.map(item => ({
      id: item._id.toString(),
      question: item.question,
      answer: item.answer,
      category: item.category,
      published: item.published,
      order: item.order,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    res.json({ faq: itemsWithIds });
  } catch (error) {
    console.error("Get FAQ items error:", error);
    res.status(500).json({ error: "Failed to get FAQ items" });
  }
});

adminRoutes.post('/faq', async (req: any, res) => {
  try {
    const { question, answer, category, published, order } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "Question and answer are required"
      });
    }

    const item = await storage.createFAQItem({
      question,
      answer,
      category: category || null,
      published: published || false,
      order: order || 0
    });

    res.json({
      success: true,
      message: 'FAQ item created successfully',
      item: {
        id: item._id.toString(),
        question: item.question,
        answer: item.answer,
        category: item.category,
        published: item.published,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.error("Create FAQ item error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create FAQ item"
    });
  }
});

adminRoutes.put('/faq/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const item = await storage.updateFAQItem(id, updates);
    if (!item) {
      return res.status(404).json({ error: "FAQ item not found" });
    }

    res.json({
      success: true,
      message: 'FAQ item updated successfully',
      item: {
        id: item._id.toString(),
        question: item.question,
        answer: item.answer,
        category: item.category,
        published: item.published,
        order: item.order,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }
    });
  } catch (error) {
    console.error("Update FAQ item error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update FAQ item"
    });
  }
});

adminRoutes.delete('/faq/:id', async (req: any, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteFAQItem(id);

    if (!deleted) {
      return res.status(404).json({ error: "FAQ item not found" });
    }

    res.json({
      success: true,
      message: 'FAQ item deleted successfully'
    });
  } catch (error) {
    console.error("Delete FAQ item error:", error);
    res.status(500).json({ error: "Failed to delete FAQ item" });
  }
});

adminRoutes.get('/newsletter/subscribers', async (req, res) => {
  try {
    const subscribers = await storage.getAllNewsletterSubscribers();
    const subscribersWithIds = subscribers.map(subscriber => ({
      id: subscriber._id.toString(),
      email: subscriber.email,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      source: subscriber.source,
      isActive: subscriber.isActive,
      subscribedAt: subscriber.subscribedAt,
      unsubscribedAt: subscriber.unsubscribedAt,
      createdAt: subscriber.createdAt
    }));

    res.json({ subscribers: subscribersWithIds });
  } catch (error) {
    console.error("Get newsletter subscribers error:", error);
    res.status(500).json({ error: "Failed to get newsletter subscribers" });
  }
});

adminRoutes.post('/newsletter/subscribers', async (req: any, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const existingSubscriber = await storage.getNewsletterSubscriber(email);
    if (existingSubscriber) {
      return res.status(400).json({ error: 'Subscriber already exists' });
    }

    const subscriber = await storage.createNewsletterSubscriber({
      email: sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} }),
      firstName: firstName ? sanitizeHtml(firstName, { allowedTags: [], allowedAttributes: {} }) : undefined,
      lastName: lastName ? sanitizeHtml(lastName, { allowedTags: [], allowedAttributes: {} }) : undefined,
      source: 'admin-added'
    });

    res.json({
      success: true,
      message: 'Newsletter subscriber added successfully',
      subscriber: {
        id: subscriber._id.toString(),
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        source: subscriber.source,
        isActive: subscriber.isActive,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    console.error("Add newsletter subscriber error:", error);
    res.status(500).json({ error: "Failed to add newsletter subscriber" });
  }
});

adminRoutes.patch('/newsletter/subscribers/:email/status', async (req: any, res) => {
  try {
    const { email } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean' });
    }

    const updates: any = { isActive };
    if (!isActive) {
      updates.unsubscribedAt = new Date();
    }

    const subscriber = await storage.updateNewsletterSubscriber(email, updates);
    if (!subscriber) {
      return res.status(404).json({ error: "Newsletter subscriber not found" });
    }

    res.json({
      success: true,
      message: `Subscriber ${isActive ? 'activated' : 'deactivated'} successfully`,
      subscriber: {
        id: subscriber._id.toString(),
        email: subscriber.email,
        isActive: subscriber.isActive,
        unsubscribedAt: subscriber.unsubscribedAt
      }
    });
  } catch (error) {
    console.error("Update newsletter subscriber status error:", error);
    res.status(500).json({ error: "Failed to update newsletter subscriber status" });
  }
});

adminRoutes.delete('/newsletter/subscribers/:email', async (req: any, res) => {
  try {
    const { email } = req.params;
    const deleted = await storage.deleteNewsletterSubscriber(email);

    if (!deleted) {
      return res.status(404).json({ error: "Newsletter subscriber not found" });
    }

    res.json({
      success: true,
      message: 'Newsletter subscriber deleted successfully'
    });
  } catch (error) {
    console.error("Delete newsletter subscriber error:", error);
    res.status(500).json({ error: "Failed to delete newsletter subscriber" });
  }
});

adminRoutes.post('/newsletter/send', async (req: any, res) => {
  try {
    const { subject, content } = req.body;

    if (!subject || !content) {
      return res.status(400).json({ error: 'Subject and content are required' });
    }

    const subscribers = await storage.getActiveNewsletterSubscribers();
    const subscriberEmails = subscribers.map(sub => sub.email);

    if (subscriberEmails.length === 0) {
      return res.status(400).json({ error: 'No active newsletter subscribers found' });
    }

    const result = await sendNewsletter(
      sanitizeHtml(subject, { allowedTags: [], allowedAttributes: {} }),
      content,
      subscriberEmails
    );

    res.json({
      success: true,
      message: `Newsletter sent to ${result.success} subscribers${result.failed > 0 ? ` (${result.failed} failed)` : ''}`,
      result
    });
  } catch (error) {
    console.error("Send newsletter error:", error);
    res.status(500).json({ error: "Failed to send newsletter" });
  }
});

adminRoutes.patch('/files/:id/mark-training', async (req: any, res) => {
  try {
    const { id } = req.params;

    const file = await storage.getFile(id);
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    if (file.uploadedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedFile = await storage.updateFileTrainingStatus(id, true, true);
    if (!updatedFile) {
      return res.status(404).json({ error: "File not found" });
    }

    res.json({
      success: true,
      message: 'File marked as training data successfully',
      file: {
        id: updatedFile._id.toString(),
        isTrainingData: updatedFile.isTrainingData,
        trainingEnabled: updatedFile.trainingEnabled,
        extractedText: updatedFile.extractedText ? 'Text extracted successfully' : 'Text extraction failed or not supported'
      }
    });
  } catch (error) {
    console.error('Mark file as training error:', error);
    res.status(500).json({ error: "Failed to mark file as training data" });
  }
});
