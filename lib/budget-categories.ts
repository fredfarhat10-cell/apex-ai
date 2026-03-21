// Default Budget Categories (YNAB-style)

import type { BudgetCategory } from "./types/budget"

export const DEFAULT_BUDGET_CATEGORIES: BudgetCategory[] = [
  // Essential - Housing
  {
    id: "cat_housing",
    name: "Housing",
    type: "essential",
    icon: "🏠",
    color: "#3b82f6",
    isDefault: true,
  },
  {
    id: "cat_rent_mortgage",
    name: "Rent/Mortgage",
    type: "essential",
    parentId: "cat_housing",
    isDefault: true,
  },
  {
    id: "cat_utilities",
    name: "Utilities",
    type: "essential",
    parentId: "cat_housing",
    isDefault: true,
  },
  {
    id: "cat_home_maintenance",
    name: "Home Maintenance",
    type: "essential",
    parentId: "cat_housing",
    isDefault: true,
  },

  // Essential - Transportation
  {
    id: "cat_transportation",
    name: "Transportation",
    type: "essential",
    icon: "🚗",
    color: "#10b981",
    isDefault: true,
  },
  {
    id: "cat_car_payment",
    name: "Car Payment",
    type: "essential",
    parentId: "cat_transportation",
    isDefault: true,
  },
  {
    id: "cat_gas",
    name: "Gas & Fuel",
    type: "essential",
    parentId: "cat_transportation",
    isDefault: true,
  },
  {
    id: "cat_public_transit",
    name: "Public Transit",
    type: "essential",
    parentId: "cat_transportation",
    isDefault: true,
  },

  // Essential - Food
  {
    id: "cat_food",
    name: "Food",
    type: "essential",
    icon: "🍽️",
    color: "#f59e0b",
    isDefault: true,
  },
  {
    id: "cat_groceries",
    name: "Groceries",
    type: "essential",
    parentId: "cat_food",
    isDefault: true,
  },
  {
    id: "cat_dining_out",
    name: "Dining Out",
    type: "discretionary",
    parentId: "cat_food",
    isDefault: true,
  },

  // Essential - Healthcare
  {
    id: "cat_healthcare",
    name: "Healthcare",
    type: "essential",
    icon: "⚕️",
    color: "#ef4444",
    isDefault: true,
  },
  {
    id: "cat_insurance",
    name: "Health Insurance",
    type: "essential",
    parentId: "cat_healthcare",
    isDefault: true,
  },
  {
    id: "cat_medical",
    name: "Medical Expenses",
    type: "essential",
    parentId: "cat_healthcare",
    isDefault: true,
  },

  // Discretionary - Entertainment
  {
    id: "cat_entertainment",
    name: "Entertainment",
    type: "discretionary",
    icon: "🎬",
    color: "#8b5cf6",
    isDefault: true,
  },
  {
    id: "cat_streaming",
    name: "Streaming Services",
    type: "discretionary",
    parentId: "cat_entertainment",
    isDefault: true,
  },
  {
    id: "cat_hobbies",
    name: "Hobbies",
    type: "discretionary",
    parentId: "cat_entertainment",
    isDefault: true,
  },

  // Discretionary - Shopping
  {
    id: "cat_shopping",
    name: "Shopping",
    type: "discretionary",
    icon: "🛍️",
    color: "#ec4899",
    isDefault: true,
  },
  {
    id: "cat_clothing",
    name: "Clothing",
    type: "discretionary",
    parentId: "cat_shopping",
    isDefault: true,
  },
  {
    id: "cat_personal_care",
    name: "Personal Care",
    type: "discretionary",
    parentId: "cat_shopping",
    isDefault: true,
  },

  // Savings
  {
    id: "cat_savings",
    name: "Savings",
    type: "savings",
    icon: "💰",
    color: "#14b8a6",
    isDefault: true,
  },
  {
    id: "cat_emergency_fund",
    name: "Emergency Fund",
    type: "savings",
    parentId: "cat_savings",
    isDefault: true,
  },
  {
    id: "cat_investments",
    name: "Investments",
    type: "savings",
    parentId: "cat_savings",
    isDefault: true,
  },

  // Debt
  {
    id: "cat_debt",
    name: "Debt Payments",
    type: "debt",
    icon: "💳",
    color: "#f97316",
    isDefault: true,
  },
  {
    id: "cat_credit_cards",
    name: "Credit Cards",
    type: "debt",
    parentId: "cat_debt",
    isDefault: true,
  },
  {
    id: "cat_student_loans",
    name: "Student Loans",
    type: "debt",
    parentId: "cat_debt",
    isDefault: true,
  },
]
