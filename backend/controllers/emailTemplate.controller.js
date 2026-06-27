const { validationResult } = require('express-validator');
const { EmailTemplate } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { sendTemplatedEmail } = require('../services/emailTemplate.service');

exports.getAllTemplates = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, event, isActive } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = {};

    if (event) where.event = event;
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const { count, rows } = await EmailTemplate.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['createdAt', 'DESC']],
    });

    return sendSuccess(res, 'Templates retrieved', {
      templates: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTemplateById = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);
    return sendSuccess(res, 'Template retrieved', { template });
  } catch (error) {
    next(error);
  }
};

exports.getTemplateByEvent = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findOne({ where: { event: req.params.event } });
    if (!template) return sendError(res, 'Template not found for this event', 404);
    return sendSuccess(res, 'Template retrieved', { template });
  } catch (error) {
    next(error);
  }
};

exports.createTemplate = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    const { name, event, subject, htmlTemplate, variables, isActive } = req.body;

    const existing = await EmailTemplate.findOne({ where: { event } });
    if (existing) {
      return sendError(res, 'Template already exists for this event', 400);
    }

    const template = await EmailTemplate.create({
      name,
      event,
      subject,
      htmlTemplate,
      variables: variables || [],
      isActive: isActive !== undefined ? isActive : true,
    });

    return sendSuccess(res, 'Template created successfully', { template }, 201);
  } catch (error) {
    next(error);
  }
};

exports.updateTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);

    const { name, subject, htmlTemplate, variables, isActive } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (subject !== undefined) updateData.subject = subject;
    if (htmlTemplate !== undefined) updateData.htmlTemplate = htmlTemplate;
    if (variables !== undefined) updateData.variables = variables;
    if (isActive !== undefined) updateData.isActive = isActive;

    await template.update(updateData);
    return sendSuccess(res, 'Template updated successfully', { template });
  } catch (error) {
    next(error);
  }
};

exports.deleteTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);

    await template.destroy();
    return sendSuccess(res, 'Template deleted successfully');
  } catch (error) {
    next(error);
  }
};

exports.toggleTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);

    await template.update({ isActive: !template.isActive });
    return sendSuccess(res, `Template ${template.isActive ? 'activated' : 'deactivated'}`, { template });
  } catch (error) {
    next(error);
  }
};

exports.previewTemplate = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);

    const { variables } = req.body;
    const { replaceVariables } = require('../services/emailTemplate.service');

    const subject = replaceVariables(template.subject, variables || {});
    const htmlContent = replaceVariables(template.htmlTemplate, variables || {});

    return sendSuccess(res, 'Template preview', {
      subject,
      html: htmlContent,
    });
  } catch (error) {
    next(error);
  }
};

exports.sendTestEmail = async (req, res, next) => {
  try {
    const template = await EmailTemplate.findByPk(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);

    const { email, variables } = req.body;
    if (!email) return sendError(res, 'Email is required', 400);

    const result = await sendTemplatedEmail(template.event, email, variables || {});

    if (result) {
      return sendSuccess(res, 'Test email sent successfully');
    } else {
      return sendError(res, 'Failed to send test email', 500);
    }
  } catch (error) {
    next(error);
  }
};
