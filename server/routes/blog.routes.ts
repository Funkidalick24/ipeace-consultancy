import { Router } from 'express';
import { storage } from '../storage';
import { sanitizeBody } from '../middleware/sanitize';
import { authenticateToken, requireAdmin } from '../middleware/auth';

export const blogRoutes = Router();

blogRoutes.get('/', async (req, res) => {
  try {
    const blogs = await storage.getPublishedBlogPosts();
    res.json({ blogs });
  } catch (error) {
    console.error("Get blogs error:", error);
    res.status(500).json({ error: "Failed to get blogs" });
  }
});

blogRoutes.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const blog = await storage.getBlogPostBySlug(slug);
    if (!blog || !blog.published) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    const blogWithParsedContent = {
      ...blog,
      content: JSON.parse(blog.content)
    };

    res.json({ blog: blogWithParsedContent });
  } catch (error) {
    console.error("Get blog error:", error);
    res.status(500).json({ error: "Failed to get blog post" });
  }
});

blogRoutes.post('/', authenticateToken, requireAdmin, sanitizeBody(['title', 'slug', 'excerpt']), async (req: any, res) => {
  try {
    const { title, slug, excerpt, content, published } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({
        success: false,
        message: "Title, slug, and content are required"
      });
    }

    const contentJson = JSON.stringify(content);

    const blogPost = await storage.createBlogPost({
      title,
      slug,
      excerpt: excerpt || null,
      content: contentJson,
      published: published || false,
      authorId: req.user._id,
    });

    res.json({
      success: true,
      message: 'Blog post created successfully',
      blog: {
        ...blogPost,
        content: JSON.parse(blogPost.content)
      }
    });
  } catch (error) {
    console.error("Create blog error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create blog post"
    });
  }
});

blogRoutes.put('/:id', authenticateToken, requireAdmin, sanitizeBody(['title', 'slug', 'excerpt']), async (req: any, res) => {
  try {
    const id = req.params.id;
    const { title, slug, excerpt, content, published } = req.body;

    const updates: any = {};
    if (title !== undefined) updates.title = title;
    if (slug !== undefined) updates.slug = slug;
    if (excerpt !== undefined) updates.excerpt = excerpt;
    if (content !== undefined) updates.content = JSON.stringify(content);
    if (published !== undefined) updates.published = published;

    const blogPost = await storage.updateBlogPost(id, updates);
    if (!blogPost) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json({
      success: true,
      message: 'Blog post updated successfully',
      blog: {
        ...blogPost,
        content: JSON.parse(blogPost.content)
      }
    });
  } catch (error) {
    console.error("Update blog error:", error);
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to update blog post"
    });
  }
});

blogRoutes.delete('/:id', authenticateToken, requireAdmin, async (req: any, res) => {
  try {
    const id = req.params.id;
    const deleted = await storage.deleteBlogPost(id);

    if (!deleted) {
      return res.status(404).json({ error: "Blog post not found" });
    }

    res.json({
      success: true,
      message: 'Blog post deleted successfully'
    });
  } catch (error) {
    console.error("Delete blog error:", error);
    res.status(500).json({ error: "Failed to delete blog post" });
  }
});
