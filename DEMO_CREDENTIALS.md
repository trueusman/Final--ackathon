# 🔐 Demo Credentials

## MaintainIQ Test Accounts

Use these accounts to test the Asset-Chronicle (MaintainIQ) application with different user roles and permissions.

---

## Login Credentials

### Admin Account
- **Email**: `admin@demo.com`
- **Password**: `Admin@2024`
- **Permissions**: Full system access including:
  - User management
  - Asset management
  - Issue assignment and tracking
  - System configuration
  - Reports and analytics
  - Notification settings

### Technician Account
- **Email**: `technician@demo.com`
- **Password**: `Tech@2024`
- **Permissions**: 
  - View assigned maintenance tasks
  - Update task status and notes
  - Log work hours and parts used
  - View asset information
  - Report new issues

### Supervisor Account
- **Email**: `supervisor@demo.com`
- **Password**: `Super@2024`
- **Permissions**: 
  - Oversee team activities
  - Assign tasks to technicians
  - Approve completed work
  - View team reports
  - Manage maintenance schedules

---

## Quick Access URLs

- **Application**: http://localhost:5173/
- **API Endpoint**: http://localhost:3000/

---

## How to Reset Demo Data

If you need to reset the database to its initial state with demo data:

```bash
cd lib/db

# Clear and recreate database (SQLite)
rm -f local.db

# Run migrations
pnpm run migrate

# Seed with demo data
pnpm run seed
```

---

## Security Notes

⚠️ **Important**: These credentials are for **demo and testing purposes only**.

- Never use these credentials in production
- Change all passwords before deploying to production
- Use strong, unique passwords for production accounts
- Enable two-factor authentication for production
- Regularly rotate credentials

---

## Testing Different Roles

### As Admin (`admin@demo.com`)
1. Log in and navigate to Users section
2. Create new users and assign roles
3. Manage assets and view all maintenance records
4. Access system configuration and reports

### As Technician (`technician@demo.com`)
1. Log in and view assigned tasks
2. Update task status (In Progress, Completed)
3. Add maintenance notes and log time
4. Report new issues or asset problems

### As Supervisor (`supervisor@demo.com`)
1. Log in and view team dashboard
2. Assign tasks to technicians
3. Review and approve completed work
4. Monitor team performance and schedules

---

## Need Help?

If you encounter login issues:
1. Verify you're using the correct email and password
2. Check that the database has been seeded (`pnpm run seed` in `lib/db`)
3. Ensure both backend and frontend servers are running
4. Clear browser cache and cookies
5. Check browser console for any error messages

---

**Last Updated**: 2024
