# 🧺 Laundry Management System

A modern, comprehensive laundry management system built with SvelteKit, TypeScript, and Supabase. This system provides a complete solution for managing laundry operations, from order processing to customer management and reporting.

## ✨ Features

### 🏪 Core Business Operations
- **Order Management**: Create, track, and manage laundry orders with real-time status updates
- **Customer Database**: Comprehensive customer information management with order history
- **Service Pricing**: Flexible pricing system with support for different service types and add-ons
- **Inventory Tracking**: Monitor supplies, equipment, and capacity
- **Payment Processing**: Support for multiple payment methods (Cash, GCash, PayMaya, Bank Transfer)

### 📊 Business Intelligence
- **Analytics Dashboard**: Real-time business metrics and KPIs
- **Financial Reporting**: Revenue tracking, profit analysis, and financial summaries
- **Operational Reports**: Service performance, customer analytics, and operational insights
- **Audit Logging**: Comprehensive audit trails for all system activities

### 🔐 Security & Authentication
- **Role-Based Access Control**: Admin, Manager, and Staff user roles with granular permissions
- **Two-Factor Authentication (2FA)**: Enhanced security for user accounts
- **Session Management**: Secure session handling with automatic timeouts
- **Rate Limiting**: Protection against abuse and unauthorized access

### 💻 Modern Technology Stack
- **Frontend**: SvelteKit with TypeScript for type-safe development
- **Backend**: Supabase for database, authentication, and real-time features
- **Styling**: Tailwind CSS for modern, responsive design
- **Icons**: Lucide Svelte for consistent iconography
- **Notifications**: Toast notifications for user feedback

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm, pnpm, or yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/laundry-management-system.git
   cd laundry-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Database Setup**
   - Run the SQL scripts in the `sql/` directory in your Supabase dashboard
   - Or use the provided migration files

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

## 📚 Documentation

Comprehensive documentation is available in the [`docs/`](./docs/) directory:

- **[📖 Complete Documentation](./docs/README.md)** - Full documentation index
- **[🏗️ System Architecture](./docs/architecture.md)** - Technical architecture overview
- **[⚙️ Installation Guide](./docs/installation.md)** - Detailed setup instructions
- **[👥 User Guides](./docs/admin-guide.md)** - User manuals for different roles
- **[🔧 API Reference](./docs/api-reference.md)** - Backend API documentation

## 🛡️ Security

This system implements enterprise-grade security features:
- End-to-end encryption for sensitive data
- Role-based access control (RBAC)
- Two-factor authentication (2FA)
- Comprehensive audit logging
- Rate limiting and DDoS protection

See the [Security Documentation](./docs/security.md) for detailed information.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](./docs/contributing.md) for details on:
- Code of conduct
- Development workflow
- Testing requirements
- Documentation standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the [docs/](./docs/) directory
- **Issues**: [Report bugs or request features](https://github.com/yourusername/laundry-management-system/issues)
- **Discussions**: [Community discussions](https://github.com/yourusername/laundry-management-system/discussions)

## 🏢 Business Use

This system is designed for:
- Small to medium-sized laundry businesses
- Dry cleaning services
- Laundromat operations
- Hotel and hospitality laundry services
- Commercial laundry providers

---

**Built with ❤️ using SvelteKit, TypeScript, and Supabase**
