# 🏗️ Code Structure Documentation

## 📁 New Folder Structure

```
frontend/src/
├── components/
│   ├── common/                    # ✅ Reusable Components
│   │   ├── FormContainer.jsx      # Universal form wrapper with tabs
│   │   ├── FormContainer.css
│   │   ├── FormField.jsx          # Reusable form field component
│   │   └── FormField.css
│   │
│   ├── forms/                     # 🚧 All form components (to be moved here)
│   │   ├── UserForm.jsx
│   │   ├── MSECreditAssessment.jsx
│   │   ├── OutputSheetForm.jsx
│   │   ├── ExpertScorecardForm.jsx
│   │   ├── FinancialAnalysisForm.jsx
│   │   ├── BankAnalysisForm.jsx
│   │   └── CreditAppMemoForm.jsx
│   │
│   ├── admin/                     # Admin components
│   ├── auth/                      # Login/Register
│   ├── loanOfficer/              # Loan officer dashboard
│   ├── FormTabs.jsx              # ✅ Universal tabs component
│   └── FormNavigation.jsx        # Sidebar navigation
│
├── hooks/                         # ✅ Custom React Hooks
│   └── useFormManagement.js      # Form initialization & save hooks
│
├── contexts/                      # React Context APIs
│   ├── AuthContext.jsx
│   └── FormProgressContext.jsx   # ✅ Global form progress state
│
├── utils/                         # Utility functions
│   └── formHelpers.js            # ✅ Form completion & navigation helpers
│
├── config/                        # Configuration files
│   ├── api.js
│   └── formSequence.js           # ✅ Form order & locking logic
│
├── data/                          # Form configurations
│   ├── formConfig.js
│   ├── mseFormConfig.js
│   ├── outputFormConfig.js
│   ├── expertScorecardConfig.js
│   ├── financialAnalysisConfig.js
│   ├── bankAnalysisConfig.js
│   └── creditAppMemoConfig.js
│
└── styles/                        # ✅ Global & shared styles
    ├── common-radio-styles.css
    └── form-tabs-common.css      # ✅ Universal tabs styling
```

---

## 🎯 Key Components

### 1. **FormContainer** (Universal Wrapper)
**Location:** `components/common/FormContainer.jsx`

**Purpose:** Wraps all forms with consistent layout and tabs

**Usage:**
```jsx
import FormContainer from '../common/FormContainer';

const MyForm = () => {
  const { formData, loading, error } = useFormInitialization('my_form');
  
  return (
    <FormContainer
      formType="my_form"
      title="My Form Title"
      description="Form description"
      loading={loading}
      error={error}
    >
      {/* Form content here */}
    </FormContainer>
  );
};
```

**Features:**
- ✅ Automatic tab integration
- ✅ Loading state handling
- ✅ Error state handling
- ✅ Responsive layout
- ✅ Consistent styling

---

### 2. **useFormManagement** (Custom Hook)
**Location:** `hooks/useFormManagement.js`

**Purpose:** Handle form initialization, loading, and saving

**Usage:**
```jsx
import { useFormInitialization, useFormSave } from '../hooks/useFormManagement';

const MyForm = () => {
  // Initialize form
  const { formData, setFormData, activeFormId, loading, error } = 
    useFormInitialization('my_form', { defaultField: '' });
  
  // Save functionality
  const { saveForm, saving } = useFormSave(activeFormId);
  
  const handleSave = async () => {
    const success = await saveForm(formData);
    if (success) {
      alert('Saved!');
    }
  };
  
  return (/* JSX */);
};
```

**Benefits:**
- ✅ Eliminates duplicate code
- ✅ Consistent error handling
- ✅ Automatic localStorage management
- ✅ Centralized API calls

---

### 3. **FormField** (Reusable Input Component)
**Location:** `components/common/FormField.jsx`

**Purpose:** Standardized form fields with consistent styling

**Usage:**
```jsx
import FormField from '../common/FormField';

<FormField
  label="Customer Name"
  name="customerName"
  type="text"
  value={formData.customerName}
  onChange={handleChange}
  required={true}
  error={errors.customerName}
  placeholder="Enter customer name"
/>

<FormField
  label="Country"
  name="country"
  type="select"
  value={formData.country}
  onChange={handleChange}
  options={['USA', 'India', 'UK']}
  required={true}
/>

<FormField
  label="Gender"
  name="gender"
  type="radio"
  value={formData.gender}
  onChange={handleChange}
  options={['Male', 'Female', 'Other']}
/>
```

**Supported Types:**
- ✅ text, email, number, date, tel
- ✅ select (dropdown)
- ✅ textarea
- ✅ radio buttons
- ✅ checkbox
- ✅ Calculated fields (auto-computed, read-only)

---

### 4. **FormTabs** (Universal Tabs)
**Location:** `components/FormTabs.jsx`

**Purpose:** Global tab navigation across all forms

**Usage:**
```jsx
// Already integrated in FormContainer
// No need to add separately
<FormTabs currentFormType="user_form" />
```

**Features:**
- ✅ Shows all 7 forms
- ✅ Locks tabs until previous completed
- ✅ Green checkmark for completed
- ✅ Uses FormProgressContext
- ✅ Responsive scrolling

---

## 🔄 Migration Guide

### How to Update Existing Forms

#### Before (Old Structure):
```jsx
const MyForm = () => {
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState(null);
  
  useEffect(() => {
    // 50+ lines of initialization code
  }, []);
  
  return (
    <>
      <FormNavigation />  // ❌ Remove
      <div className="my-form">
        <FormTabs currentFormType="my_form" />
        <div className="form-header">
          <h1>Title</h1>
        </div>
        {/* Form content */}
      </div>
    </>
  );
};
```

#### After (New Structure):
```jsx
import FormContainer from '../common/FormContainer';
import FormField from '../common/FormField';
import { useFormInitialization, useFormSave } from '../../hooks/useFormManagement';

const MyForm = () => {
  const { formData, setFormData, activeFormId, loading, error } = 
    useFormInitialization('my_form');
  
  const { saveForm, saving } = useFormSave(activeFormId);
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  return (
    <FormContainer
      formType="my_form"
      title="My Form"
      description="Description here"
      loading={loading}
      error={error}
    >
      <div className="fields-grid">
        <FormField
          label="Field Name"
          name="fieldName"
          type="text"
          value={formData.fieldName}
          onChange={handleChange}
          required
        />
      </div>
      
      <button onClick={() => saveForm(formData)} disabled={saving}>
        {saving ? 'Saving...' : 'Save'}
      </button>
    </FormContainer>
  );
};
```

**Benefits:**
- 🔥 90% less boilerplate code
- ✅ Consistent UI/UX
- ✅ Easier maintenance
- ✅ Better error handling
- ✅ Automatic tab integration

---

## 🎨 Styling Convention

### Component-Specific Styles
Each component has its own CSS file:
```
MyForm.jsx  →  MyForm.css
```

### Shared Styles
Common styles in `styles/` folder:
- `form-tabs-common.css` - Tab styling
- `common-radio-styles.css` - Radio button styles

### CSS Classes Naming
Use BEM-like convention:
```css
.form-container         /* Block */
.form-container__header /* Block__Element */
.form-container--loading /* Block--Modifier */
```

---

## 📊 Form Sequence & Types

| Order | Form Type | Excel Sheet | Component |
|-------|-----------|-------------|-----------|
| 1 | `user_form` | Customer Details | UserForm.jsx |
| 2 | `mse_assessment` | Input Sheet >$50K | MSECreditAssessment.jsx |
| 3 | `output_sheet` | Output Sheet <=$50K | OutputSheetForm.jsx |
| 4 | `expert_scorecard` | Expert Scorecard | ExpertScorecardForm.jsx |
| 5 | `financial_analysis` | Financial Analysis >$50K | FinancialAnalysisForm.jsx |
| 6 | `bank_analysis` | Bank Analysis >$50K | BankAnalysisForm.jsx |
| 7 | `credit_app_memo` | Credit App Memo | CreditAppMemoForm.jsx |

---

## 🚀 Best Practices

### 1. Always Use FormContainer
```jsx
// ✅ Good
<FormContainer formType="my_form" title="My Form">
  {/* content */}
</FormContainer>

// ❌ Bad
<div className="my-form">
  <FormTabs currentFormType="my_form" />
  {/* content */}
</div>
```

### 2. Use Custom Hooks
```jsx
// ✅ Good
const { formData, loading } = useFormInitialization('my_form');

// ❌ Bad
const [formData, setFormData] = useState({});
useEffect(() => { /* manual initialization */ }, []);
```

### 3. Use FormField Component
```jsx
// ✅ Good
<FormField label="Name" name="name" type="text" {...props} />

// ❌ Bad
<div className="form-field">
  <label>Name</label>
  <input type="text" name="name" />
</div>
```

### 4. Consistent Error Handling
```jsx
// ✅ Good
const { error } = useFormInitialization('my_form');
return <FormContainer error={error}>{/* content */}</FormContainer>;

// ❌ Bad
try { /* manual error handling */ } catch (e) { alert(e) }
```

---

## 🔧 Configuration Files

### Form Sequence (`config/formSequence.js`)
Defines form order, routes, and locking logic

### Form Configs (`data/*.js`)
Each form has its own config file defining:
- Fields
- Validation rules
- Calculations
- Sections

---

## 📦 Benefits of New Structure

1. **90% Less Boilerplate**
   - Common logic extracted to hooks
   - Reusable components

2. **Consistent UI/UX**
   - Same tabs everywhere
   - Uniform styling
   - Standard error handling

3. **Easy Maintenance**
   - Change once, reflect everywhere
   - Clear separation of concerns

4. **Better Performance**
   - Shared state (FormProgressContext)
   - No duplicate API calls

5. **Developer Experience**
   - Clear folder structure
   - Easy to find files
   - Self-documenting code

---

## 🎯 Next Steps

1. ✅ Backend enum fixed (credit_app_memo added)
2. ✅ New structure created
3. 🚧 Migrate existing forms to new structure
4. 🚧 Test all forms with new components
5. 🚧 Remove old duplicate code
6. 🚧 Add unit tests for hooks

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Look at FormContainer/FormField examples
3. Review useFormManagement hook
4. Test with existing working forms
