# Admin Dashboard Documentation

## Overview
This admin dashboard provides comprehensive management capabilities for the Vytal application, allowing administrators to manage users, posts, view analytics, and configure system settings.

## Folder Structure

```
frontend/
├── app/
│   └── admin/
│       ├── login/
│       │   └── page.tsx              # Admin login page
│       └── dashboard/
│           ├── page.tsx              # Main admin dashboard
│           ├── users/
│           │   └── page.tsx          # User management
│           ├── posts/
│           │   └── page.tsx          # Post management
│           ├── analytics/
│           │   └── page.tsx          # Analytics dashboard
│           └── settings/
│               └── page.tsx          # System settings
└── components/
    └── admin/
        ├── layout/
        │   ├── AdminLayout.tsx       # Main admin layout
        │   ├── AdminRouteGuard.tsx   # Admin route protection
        │   ├── AdminPageWrapper.tsx  # Wrapper component
        │   └── index.ts              # Export file
        ├── users/                    # User management components
        └── posts/                    # Post management components
```

## Features

### 1. Admin Authentication
- **Secure Login**: Admin-only login page with role verification
- **Route Protection**: Automatic redirect for non-admin users
- **Session Management**: Secure session handling with JWT tokens

### 2. Dashboard Overview
- **Statistics Cards**: Key metrics at a glance
- **Recent Activity**: Latest users and posts
- **Quick Actions**: Fast access to common tasks

### 3. User Management
- **User Listing**: Comprehensive table with filtering and search
- **Role Management**: View and manage user roles (Donor/Recipient)
- **Status Control**: Activate, suspend, or delete users
- **Category Tracking**: View user interests and categories

### 4. Post Management
- **Post Approval**: Review and approve pending posts
- **Status Management**: Change post status (Open/Fulfilled/Cancelled)
- **Category Filtering**: Filter by blood, organs, medicines, supplies, fundraiser
- **Engagement Metrics**: View likes, views, and other engagement data

### 5. Analytics
- **User Growth**: Track user registration trends
- **Category Distribution**: Visualize post categories
- **Engagement Metrics**: Monitor user activity and session data
- **Real-time Stats**: Current active users and system health

### 6. System Settings
- **General Settings**: Site configuration and maintenance mode
- **Security Settings**: Password policies and session management
- **Notification Settings**: Email alerts and system notifications
- **Moderation Settings**: Auto-approval and content review policies

## Design System

### Color Scheme
- **Primary**: Red tones (`red-600`, `red-700`) for admin branding
- **Secondary**: Various colors for different data types
- **Background**: Gradient from red-50 to red-100 with glassmorphism effects

### Components
- **Glassmorphism**: Backdrop blur with transparency for modern look
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Interactive Elements**: Hover effects and smooth transitions
- **Icons**: React Icons (Font Awesome) for consistent iconography

## Security Features

### Role-Based Access Control
```typescript
// Example role check
if (user?.role !== "admin") {
  router.push("/admin/login");
}
```

### Route Protection
- All admin routes are protected by `AdminRouteGuard`
- Automatic redirection based on user role
- Session validation on route changes

### Data Validation
- Form validation on all input fields
- Type-safe TypeScript implementations
- Secure state management

## API Integration

### Expected Backend Endpoints
```typescript
// User Management
GET    /api/v1/admin/users        # Get all users
PUT    /api/v1/admin/users/:id    # Update user
DELETE /api/v1/admin/users/:id    # Delete user

// Post Management  
GET    /api/v1/admin/posts        # Get all posts
PUT    /api/v1/admin/posts/:id    # Update post status
DELETE /api/v1/admin/posts/:id    # Delete post

// Analytics
GET    /api/v1/admin/analytics    # Get dashboard analytics

// Settings
GET    /api/v1/admin/settings     # Get system settings
PUT    /api/v1/admin/settings     # Update settings
```

## Usage Instructions

### 1. Admin Registration
Since admin registration should be secure, it should be done through:
- Direct database insertion
- Command-line tool
- Secure backend endpoint (not exposed to frontend)

```sql
-- Example admin user creation
INSERT INTO users (name, email, password, role, phone_number, categories) 
VALUES ('Admin User', 'admin@vytal.com', 'hashed_password', 'admin', '+1234567890', '[]');
```

### 2. Admin Login
1. Navigate to `/admin/login`
2. Enter admin credentials
3. System verifies admin role
4. Redirect to admin dashboard

### 3. Managing Users
1. Go to "Users" section
2. Use filters to find specific users
3. Click action buttons to manage users
4. View detailed user information

### 4. Managing Posts
1. Navigate to "Posts" section
2. Review pending posts
3. Approve, reject, or modify posts
4. Monitor post engagement

### 5. Viewing Analytics
1. Access "Analytics" section
2. Select time period
3. Review growth trends
4. Monitor system health

### 6. Configuring Settings
1. Go to "Settings" section
2. Navigate between tabs
3. Modify configuration values
4. Save changes

## Customization

### Adding New Admin Features
1. Create new page in `app/admin/dashboard/`
2. Add navigation item to `AdminLayout.tsx`
3. Implement required components
4. Add necessary API calls

### Styling Modifications
- Modify Tailwind classes in components
- Update color scheme in CSS variables
- Adjust responsive breakpoints

### Component Extensions
- Add new management sections
- Implement additional analytics
- Create custom dashboard widgets

## Best Practices

### Security
- Always validate admin role before sensitive operations
- Use secure HTTP methods for API calls
- Implement proper error handling
- Log admin actions for audit trails

### Performance
- Implement pagination for large data sets
- Use React.memo for expensive components
- Optimize image loading and caching
- Implement proper loading states

### User Experience
- Provide clear feedback for actions
- Implement confirmation dialogs for destructive actions
- Use consistent navigation patterns
- Ensure responsive design across devices

## Troubleshooting

### Common Issues
1. **403 Unauthorized**: Check user role and permissions
2. **Route Not Found**: Verify route protection is working
3. **Data Not Loading**: Check API endpoints and network requests
4. **Styling Issues**: Verify Tailwind CSS classes and responsive design

### Debug Tips
- Use browser dev tools to check network requests
- Verify localStorage for authentication tokens
- Check console for JavaScript errors
- Test with different screen sizes

## Future Enhancements

### Planned Features
- Real-time notifications
- Advanced analytics with charts
- Bulk operations for users/posts
- Export functionality for reports
- Mobile app for admin access

### Technical Improvements
- Implement React Query for better data management
- Add unit tests for components
- Implement E2E testing
- Add performance monitoring
- Implement proper error boundaries

## Support

For technical support or feature requests:
1. Check existing documentation
2. Review console errors
3. Test with mock data
4. Contact development team

---

This admin dashboard provides a solid foundation for managing the Vytal application with room for future enhancements and customizations.
