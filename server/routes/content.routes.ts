import { Router } from 'express';
import { storage } from '../storage';
import { insertContactSchema } from '@shared/schema';
import { sendContactNotification, sendAutoReply, sendContactConfirmation, sendContactResponse, sendNewsletter } from '../services/email';
import sanitizeHtml from 'sanitize-html';
import { authenticateToken, requireAdmin } from '../middleware/auth';

export const contentRoutes = Router();

contentRoutes.get('/testimonials', async (req, res) => {
  try {
    const testimonials = await storage.getPublishedTestimonials();
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
    console.error("Get public testimonials error:", error);
    res.status(500).json({ error: "Failed to get testimonials" });
  }
});

contentRoutes.get('/team', async (req, res) => {
  try {
    const members = await storage.getPublishedTeamMembers();
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
    console.error("Get public team members error:", error);
    res.status(500).json({ error: "Failed to get team members" });
  }
});

contentRoutes.get('/faq', async (req, res) => {
  try {
    const items = await storage.getPublishedFAQItems();
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
    console.error("Get public FAQ items error:", error);
    res.status(500).json({ error: "Failed to get FAQ items" });
  }
});

contentRoutes.post('/contact', async (req, res) => {
  try {
    const validatedData = insertContactSchema.parse(req.body);

    const sanitizedData = {
      firstName: sanitizeHtml(validatedData.firstName, { allowedTags: [], allowedAttributes: {} }),
      lastName: sanitizeHtml(validatedData.lastName, { allowedTags: [], allowedAttributes: {} }),
      email: sanitizeHtml(validatedData.email, { allowedTags: [], allowedAttributes: {} }),
      company: validatedData.company ? sanitizeHtml(validatedData.company, { allowedTags: [], allowedAttributes: {} }) : undefined,
      service: validatedData.service ? sanitizeHtml(validatedData.service, { allowedTags: [], allowedAttributes: {} }) : undefined,
      message: sanitizeHtml(validatedData.message, { allowedTags: [], allowedAttributes: {} }),
      newsletter: validatedData.newsletter
    };

    const contact = await storage.createContactSubmission(sanitizedData);

    if (sanitizedData.newsletter) {
      try {
        const existingSubscriber = await storage.getNewsletterSubscriber(sanitizedData.email);

        if (!existingSubscriber) {
          const newSubscriber = await storage.createNewsletterSubscriber({
            email: sanitizedData.email,
            firstName: sanitizedData.firstName,
            lastName: sanitizedData.lastName,
            source: 'contact-form'
          });
          console.log(`✅ Added ${sanitizedData.email} to newsletter subscribers from contact form`, newSubscriber._id);
        } else {
          console.log(`ℹ️ ${sanitizedData.email} already subscribed to newsletter`);
        }
      } catch (newsletterError) {
        console.error('❌ Error adding newsletter subscriber from contact form:', newsletterError);
      }
    }

    await sendContactNotification({
      ...sanitizedData,
      company: sanitizedData.company || undefined,
      service: sanitizedData.service || undefined,
      newsletter: sanitizedData.newsletter || false,
    });
    await sendAutoReply(validatedData.email, validatedData.firstName);

    res.json({
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
      id: contact._id?.toString()
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to process contact form"
    });
  }
});

contentRoutes.post('/newsletter/subscribe', async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const sanitizedEmail = sanitizeHtml(email, { allowedTags: [], allowedAttributes: {} });
    const sanitizedFirstName = firstName ? sanitizeHtml(firstName, { allowedTags: [], allowedAttributes: {} }) : undefined;
    const sanitizedLastName = lastName ? sanitizeHtml(lastName, { allowedTags: [], allowedAttributes: {} }) : undefined;

    const existingSubscriber = await storage.getNewsletterSubscriber(sanitizedEmail);
    if (existingSubscriber) {
      return res.json({
        success: true,
        message: "Email is already subscribed to newsletter",
        alreadySubscribed: true
      });
    }

    const subscriber = await storage.createNewsletterSubscriber({
      email: sanitizedEmail,
      firstName: sanitizedFirstName,
      lastName: sanitizedLastName,
      source: 'website-signup'
    });

    console.log(`✅ Added ${sanitizedEmail} to newsletter subscribers via public API`);

    res.json({
      success: true,
      message: "Successfully subscribed to newsletter",
      subscriber: {
        id: subscriber._id.toString(),
        email: subscriber.email,
        firstName: subscriber.firstName,
        lastName: subscriber.lastName,
        source: subscriber.source,
        subscribedAt: subscriber.subscribedAt
      }
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to subscribe to newsletter"
    });
  }
});
