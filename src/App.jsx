import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './contexts/AuthContext';
import { FormProgressProvider } from './contexts/FormProgressContext';
import Header from './components/Header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import UserForm from './components/UserForm';
import MSECreditAssessment from './components/MSECreditAssessment';
import OutputSheetForm from './components/OutputSheetForm';
import ExpertScorecardForm from './components/ExpertScorecardForm';
import FinancialAnalysisForm from './components/FinancialAnalysisForm';
import BankAnalysisForm from './components/BankAnalysisForm';
import CreditAppMemoForm from './components/CreditAppMemoForm';
import AdminDashboard from './components/admin/AdminDashboard';
import FormSubmissions from './components/admin/FormSubmissions';
import SubmissionDetail from './components/admin/SubmissionDetail';
import UserManagement from './components/admin/UserManagement';
import UserCreation from './components/admin/UserCreation';
import UserSubmissions from './components/admin/UserSubmissions';
import LoanOfficerClients from './components/admin/LoanOfficerClients';
import ClientFormsDetail from './components/admin/ClientFormsDetail';
import LoanOfficerDashboard from './components/loanOfficer/LoanOfficerDashboard';
import LoanOfficerClientForms from './components/loanOfficer/LoanOfficerClientForms';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

// Admin Route Protection
const AdminRoute = ({ children }) => {
  // const token = localStorage.getItem('adminToken');
  // return token ? children : <Navigate to="/admin/login" replace />;

  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;

};

// Loan Officer Route Protection
const LoanOfficerRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  // In a real app, you'd decode the token to check the role
  // For now, we'll assume the role is checked on the backend
  return children;
};

function App() {
  return (
    <AuthProvider>
      <FormProgressProvider>
        <Router>
          <div className="App">
            <Header />
            <Routes>
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Loan Officer Dashboard */}
              <Route
                path="/loan-officer/dashboard"
                element={
                  <LoanOfficerRoute>
                    <LoanOfficerDashboard />
                  </LoanOfficerRoute>
                }
              />

              {/* Loan Officer - View Client Forms */}
              <Route
                path="/loan-officer/clients/:clientId/forms"
                element={
                  <LoanOfficerRoute>
                    <LoanOfficerClientForms />
                  </LoanOfficerRoute>
                }
              />

              {/* Legacy loan officer route redirect */}
              <Route
                path="/loan-officer"
                element={<Navigate to="/loan-officer/dashboard" replace />}
              />

              {/* User Routes */}
              <Route
                path="/form"
                element={
                  <ProtectedRoute>
                    <UserForm />
                  </ProtectedRoute>
                }
              />

              {/* Resume form with formId */}
              <Route
                path="/form/:formId"
                element={
                  <ProtectedRoute>
                    <UserForm />
                  </ProtectedRoute>
                }
              />

              {/* MSE Credit Assessment Route */}
              <Route
                path="/mse-assessment"
                element={
                  <ProtectedRoute>
                    <MSECreditAssessment />
                  </ProtectedRoute>
                }
              />

              {/* Output Sheet Analysis Route */}
              <Route
                path="/output-analysis"
                element={
                  <ProtectedRoute>
                    <OutputSheetForm />
                  </ProtectedRoute>
                }
              />

              {/* Expert Scorecard Route */}
              <Route
                path="/expert-scorecard"
                element={
                  <ProtectedRoute>
                    <ExpertScorecardForm />
                  </ProtectedRoute>
                }
              />

              {/* Financial Analysis Route */}
              <Route
                path="/financial-analysis"
                element={
                  <ProtectedRoute>
                    <FinancialAnalysisForm />
                  </ProtectedRoute>
                }
              />

              {/* Bank Analysis Route */}
              <Route
                path="/bank-analysis"
                element={
                  <ProtectedRoute>
                    <BankAnalysisForm />
                  </ProtectedRoute>
                }
              />

              {/* Credit App Memo Route */}
              <Route
                path="/credit-app-memo"
                element={
                  <ProtectedRoute>
                    <CreditAppMemoForm />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                }
              />

              {/* Admin User Management Route */}
              <Route
                path="/admin/users"
                element={
                  <AdminRoute>
                    <UserManagement />
                  </AdminRoute>
                }
              />

              {/* Admin User Creation Route */}
              <Route
                path="/admin/users/create"
                element={
                  <AdminRoute>
                    <UserCreation />
                  </AdminRoute>
                }
              />

              {/* Admin User Submissions Route */}
              <Route
                path="/admin/users/:userId/submissions"
                element={
                  <AdminRoute>
                    <UserSubmissions />
                  </AdminRoute>
                }
              />

              {/* Admin Loan Officer Clients Route */}
              <Route
                path="/admin/users/:userId/clients"
                element={
                  <AdminRoute>
                    <LoanOfficerClients />
                  </AdminRoute>
                }
              />

              {/* Admin Client Forms Detail Route */}
              <Route
                path="/admin/clients/:clientId/forms"
                element={
                  <AdminRoute>
                    <ClientFormsDetail />
                  </AdminRoute>
                }
              />

              {/* Admin Form Submission Routes */}
              <Route
                path="/admin/forms/:formType"
                element={
                  <AdminRoute>
                    <FormSubmissions />
                  </AdminRoute>
                }
              />

              {/* Admin Submission Detail Routes */}
              <Route
                path="/admin/submissions/:formType/:submissionId"
                element={
                  <AdminRoute>
                    <SubmissionDetail />
                  </AdminRoute>
                }
              />

              {/* Default Routes */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/admin/login" element={<Navigate to="/login" replace />} />
              <Route path="/dashboard" element={<Navigate to="/form" replace />} />
            </Routes>
          </div>
        </Router>
      </FormProgressProvider>
    </AuthProvider>
  );
}

export default App;