const express = require("express")
const UserController = require("../controllers/userController")
const AdminController = require("../controllers/adminController")
const { authenticateUser } = require("../middleware/auth")
const { validateUserId } = require("../middleware/validation")

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

// User routes
router.get("/dashboard", UserController.getDashboard)
router.put("/preferences", UserController.updatePreferences)
router.get("/statistics", UserController.getStatistics)
router.post("/export", UserController.exportData)
router.delete("/account", UserController.deleteAccount)

// Admin routes (require admin permissions)
router.use("/admin", AdminController.checkAdminPermissions)
router.get("/admin/stats", AdminController.getPlatformStats)
router.get("/admin/users", AdminController.getUsers)
router.put("/admin/users/:userId/status", validateUserId, AdminController.updateUserStatus)
router.get("/admin/analytics", AdminController.getTransactionAnalytics)

module.exports = router
