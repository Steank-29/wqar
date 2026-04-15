const express = require('express');
const { 
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  bulkDeleteProducts,
  updateStock,
  getProductStats,
  uploadProductImages
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const uploadProduct = require('../middleware/uploadProduct'); // CHANGE THIS - use product-specific upload

const router = express.Router();

// Public routes
router.get('/stats/summary', getProductStats);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Admin only routes - CHANGE upload.array to uploadProduct.array
router.post('/', protect, admin, uploadProduct.array('images', 5), createProduct);
router.put('/:id', protect, admin, uploadProduct.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.delete('/:id/images/:imageIndex', protect, admin, deleteProductImage);
router.delete('/bulk/delete', protect, admin, bulkDeleteProducts);
router.patch('/:id/stock', protect, admin, updateStock);
router.post('/:id/upload-images', protect, admin, uploadProduct.array('images', 5), uploadProductImages);

module.exports = router;