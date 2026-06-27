const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const {
  getAllTemplates,
  getTemplateById,
  getTemplateByEvent,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplate,
  previewTemplate,
  sendTestEmail,
} = require('../controllers/emailTemplate.controller');

const createTemplateValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('event').notEmpty().withMessage('Event is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('htmlTemplate').notEmpty().withMessage('HTML template is required'),
];

router.get('/', authMiddleware, authorize(['admin']), getAllTemplates);
router.get('/:id', authMiddleware, authorize(['admin']), getTemplateById);
router.get('/event/:event', authMiddleware, authorize(['admin']), getTemplateByEvent);

router.post('/', authMiddleware, authorize(['admin']), createTemplateValidation, createTemplate);
router.put('/:id', authMiddleware, authorize(['admin']), updateTemplate);
router.delete('/:id', authMiddleware, authorize(['admin']), deleteTemplate);
router.patch('/:id/toggle', authMiddleware, authorize(['admin']), toggleTemplate);
router.post('/:id/preview', authMiddleware, authorize(['admin']), previewTemplate);
router.post('/:id/send-test', authMiddleware, authorize(['admin']), sendTestEmail);

module.exports = router;
