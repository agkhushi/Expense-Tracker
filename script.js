// DOM Elements
const expenseForm = document.getElementById('expense-form');
const expenseNameInput = document.getElementById('expense-name');
const expenseAmountInput = document.getElementById('expense-amount');
const expenseCategoryInput = document.getElementById('expense-category');
const expenseDateInput = document.getElementById('expense-date');
const transactionsList = document.getElementById('transactions-list');
const totalAmountElement = document.getElementById('total-amount');
const filterCategorySelect = document.getElementById('filter-category');
const filterMonthInput = document.getElementById('filter-month');
const avgDailyElement = document.getElementById('avg-daily');
const highestExpenseElement = document.getElementById('highest-expense');
const expensiveCategoryElement = document.getElementById('expensive-category');
const currencySelector = document.getElementById('currency-selector');
const darkModeToggle = document.getElementById('dark-mode-toggle');

// Income form elements
const incomeForm = document.getElementById('income-form');
const incomeNameInput = document.getElementById('income-name');
const incomeAmountInput = document.getElementById('income-amount');
const incomeCategoryInput = document.getElementById('income-category');
const incomeDateInput = document.getElementById('income-date');

// Balance elements
let incomeTotalElement = document.getElementById('income-total');
let expensesTotalElement = document.getElementById('expenses-total');
let remainingTotalElement = document.getElementById('remaining-total');
const refreshBalanceBtn = document.getElementById('refresh-balance');

// Form and transaction tabs
const formTabs = document.querySelectorAll('.form-tab');
const tabContents = document.querySelectorAll('.tab-content');
const transactionTabs = document.querySelectorAll('.transaction-tab');

// Category widgets elements
const categoryAmountElements = {
    food: document.getElementById('food-amount'),
    transportation: document.getElementById('transportation-amount'),
    housing: document.getElementById('housing-amount'),
    utilities: document.getElementById('utilities-amount'),
    entertainment: document.getElementById('entertainment-amount'),
    education: document.getElementById('education-amount'),
    other: document.getElementById('other-amount')
};

const categoryTrendElements = {
    food: document.getElementById('food-trend'),
    transportation: document.getElementById('transportation-trend'),
    housing: document.getElementById('housing-trend'),
    utilities: document.getElementById('utilities-trend'),
    entertainment: document.getElementById('entertainment-trend'),
    education: document.getElementById('education-trend'),
    other: document.getElementById('other-trend')
};

// Chart Elements
const monthlyChartCanvas = document.getElementById('monthly-chart');
const categoryChartCanvas = document.getElementById('category-chart');
const balanceChartCanvas = document.getElementById('balance-chart');

// Global variables
let expenses = [];
let incomes = [];
let monthlyChart = null;
let categoryChart = null;
let balanceChart = null;
let editingExpenseId = null;
let editingIncomeId = null;
let selectedCurrency = 'INR';
let previousMonthCategoryTotals = {};
let currentView = 'expenses'; // 'expenses', 'income', or 'all'
let isDarkMode = localStorage.getItem('darkMode') === 'true';

// Currency symbols and settings
const currencies = {
    INR: { symbol: '₹', position: 'before', code: 'INR', decimals: 2 },
    USD: { symbol: '$', position: 'before', code: 'USD', decimals: 2 },
    EUR: { symbol: '€', position: 'before', code: 'EUR', decimals: 2 },
    GBP: { symbol: '£', position: 'before', code: 'GBP', decimals: 2 },
    JPY: { symbol: '¥', position: 'before', code: 'JPY', decimals: 0 },
    CAD: { symbol: 'C$', position: 'before', code: 'CAD', decimals: 2 },
    AUD: { symbol: 'A$', position: 'before', code: 'AUD', decimals: 2 },
    CNY: { symbol: '¥', position: 'before', code: 'CNY', decimals: 2 },
    BRL: { symbol: 'R$', position: 'before', code: 'BRL', decimals: 2 },
    RUB: { symbol: '₽', position: 'after', code: 'RUB', decimals: 2 },
    KRW: { symbol: '₩', position: 'before', code: 'KRW', decimals: 0 },
    CHF: { symbol: 'Fr', position: 'after', code: 'CHF', decimals: 2 },
    MXN: { symbol: '$', position: 'before', code: 'MXN', decimals: 2 },
    SGD: { symbol: 'S$', position: 'before', code: 'SGD', decimals: 2 },
    NZD: { symbol: 'NZ$', position: 'before', code: 'NZD', decimals: 2 }
};

// Set default dates to today
expenseDateInput.valueAsDate = new Date();
incomeDateInput.valueAsDate = new Date();

// Budget planning variables
let budgets = JSON.parse(localStorage.getItem('budgets')) || {};
const budgetMonthSelect = document.getElementById('budget-month');
const addBudgetItemBtn = document.getElementById('add-budget-item');
const budgetList = document.getElementById('budget-list');
const totalPlannedEl = document.getElementById('total-planned');
const totalActualEl = document.getElementById('total-actual');
const totalRemainingEl = document.getElementById('total-remaining');
const totalProgressEl = document.getElementById('total-progress');

// Financial reports variables
const reportTabs = document.querySelectorAll('.report-tab');
const reportChart = document.getElementById('report-chart');
const exportPdfBtn = document.getElementById('export-pdf');
const exportCsvBtn = document.getElementById('export-csv');
let currentReport = 'cash-flow';
let reportChartInstance = null;

// Initialize budget month selector to current month
const currentDate = new Date();
budgetMonthSelect.value = currentDate.getMonth() + 1;

// Add Budget Item button event
addBudgetItemBtn.addEventListener('click', () => {
    showAddBudgetModal();
});

// Budget month change event
budgetMonthSelect.addEventListener('change', () => {
    renderBudgets();
});

// Report tab click events
reportTabs.forEach(tab => {
    tab.addEventListener('click', () => {
        reportTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentReport = tab.dataset.report;
        generateReport(currentReport);
    });
});

// Export buttons events
exportPdfBtn.addEventListener('click', exportReportToPdf);
exportCsvBtn.addEventListener('click', exportReportToCsv);

// Add budget item modal
function showAddBudgetModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>Add Budget Item</h3>
            <form id="budget-form">
                <div class="form-group">
                    <label for="budget-category">Category</label>
                    <select id="budget-category" required>
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="transportation">Transportation</option>
                        <option value="housing">Housing</option>
                        <option value="utilities">Utilities</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="education">Education</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="budget-amount">Planned Amount</label>
                    <input type="number" id="budget-amount" min="0" step="0.01" required>
                </div>
                <button type="submit" class="btn">Add Budget</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close button functionality
    const closeBtn = modal.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // Click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
    
    // Form submission
    const budgetForm = modal.querySelector('#budget-form');
    budgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const category = budgetForm.querySelector('#budget-category').value;
        const amount = parseFloat(budgetForm.querySelector('#budget-amount').value);
        const month = budgetMonthSelect.value;
        const year = currentDate.getFullYear();
        const monthYear = `${year}-${month.padStart(2, '0')}`;
        
        // Initialize month if not exists
        if (!budgets[monthYear]) {
            budgets[monthYear] = {};
        }
        
        // Set budget for category
        budgets[monthYear][category] = amount;
        
        // Save to localStorage
        localStorage.setItem('budgets', JSON.stringify(budgets));
        
        // Close modal
        document.body.removeChild(modal);
        
        // Update UI
        renderBudgets();
    });
}

// Render budgets for selected month
function renderBudgets() {
    const month = budgetMonthSelect.value;
    const year = currentDate.getFullYear();
    const monthYear = `${year}-${month.padStart(2, '0')}`;
    
    // Clear list
    budgetList.innerHTML = '';
    
    // Check if we have budgets for this month
    if (!budgets[monthYear]) {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `
            <td colspan="5" class="empty-message">No budgets set for this month. Add a budget to get started.</td>
        `;
        budgetList.appendChild(emptyRow);
        
        // Reset totals
        totalPlannedEl.textContent = formatCurrency(0);
        totalActualEl.textContent = formatCurrency(0);
        totalRemainingEl.textContent = formatCurrency(0);
        totalProgressEl.style.width = '0%';
        
        return;
    }
    
    // Get expenses for this month
    const monthExpenses = expenses.filter(expense => {
        return expense.date.startsWith(monthYear);
    });
    
    // Calculate totals
    let totalPlanned = 0;
    let totalActual = 0;
    
    // Generate rows for each budget category
    Object.entries(budgets[monthYear]).forEach(([category, planned]) => {
        const actual = monthExpenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0);
        
        const remaining = planned - actual;
        const progress = Math.min((actual / planned) * 100, 100);
        
        totalPlanned += planned;
        totalActual += actual;
        
        const row = document.createElement('tr');
        row.className = actual > planned ? 'over-budget' : '';
        
        row.innerHTML = `
            <td>
                <div class="category-badge ${category}">
                    ${category.charAt(0).toUpperCase() + category.slice(1)}
                </div>
            </td>
            <td>${formatCurrency(planned)}</td>
            <td>${formatCurrency(actual)}</td>
            <td class="${remaining < 0 ? 'negative' : ''}">${formatCurrency(remaining)}</td>
            <td>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${progress}%"></div>
                </div>
            </td>
        `;
        
        budgetList.appendChild(row);
    });
    
    // Update totals
    const totalRemaining = totalPlanned - totalActual;
    const totalProgress = Math.min((totalActual / totalPlanned) * 100, 100);
    
    totalPlannedEl.textContent = formatCurrency(totalPlanned);
    totalActualEl.textContent = formatCurrency(totalActual);
    totalRemainingEl.textContent = formatCurrency(totalRemaining);
    totalProgressEl.style.width = `${totalProgress}%`;
    
    if (totalActual > totalPlanned) {
        totalProgressEl.parentElement.parentElement.classList.add('over-budget');
                } else {
        totalProgressEl.parentElement.parentElement.classList.remove('over-budget');
    }
}

// Initialize Money Manager features
function initMoneyManagerFeatures() {
    renderBudgets();
    
    // Set cash flow tab as active by default and generate report
    const cashFlowTab = document.querySelector('.report-tab[data-report="cash-flow"]');
    if (cashFlowTab) {
        // Remove active class from all tabs first
        document.querySelectorAll('.report-tab').forEach(tab => tab.classList.remove('active'));
        // Set cash flow tab as active
        cashFlowTab.classList.add('active');
        currentReport = 'cash-flow';
    }

    // Ensure the report chart exists and is visible
    const reportChartContainer = document.querySelector('.report-chart-container');
    if (reportChartContainer) {
        reportChartContainer.style.display = 'block';
    }

    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        updateMonthlyChart();
        updateCategoryChart();
        updateBalanceChart();
        // Generate initial cash flow report
        generateReport('cash-flow');
    } else {
        console.error('Chart.js is not loaded. Please ensure Chart.js is properly included.');
    }
}

// Generate financial report
function generateReport(reportType) {
    // Ensure the report chart canvas exists
    const reportChart = document.getElementById('report-chart');
    if (!reportChart) {
        console.error('Report chart canvas not found');
        return;
    }

    // Destroy previous chart if exists
    if (reportChartInstance) {
        reportChartInstance.destroy();
    }

    // Clear any existing chart
    const ctx = reportChart.getContext('2d');
    ctx.clearRect(0, 0, reportChart.width, reportChart.height);
    
    // Set up chart data based on report type
    let chartData;
    let chartOptions;
    
    if (reportType === 'cash-flow') {
        chartData = generateCashFlowData();
        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        };
        
        reportChartInstance = new Chart(reportChart, {
            type: 'bar',
            data: chartData,
            options: chartOptions
        });
    }
    else if (reportType === 'category-breakdown') {
        chartData = generateCategoryBreakdownData();
        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = context.parsed || 0;
                            return `${label}: ${formatCurrency(value)} (${percentage.toFixed(1)}%)`;
                        }
                    }
                }
            }
        };
        
        reportChartInstance = new Chart(reportChart, {
            type: 'doughnut',
            data: chartData,
            options: chartOptions
        });
    }
    else if (reportType === 'savings-trend') {
        chartData = generateSavingsTrendData();
        chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    display: true
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatCurrency(context.raw);
                        }
                    }
                }
            }
        };
        
        reportChartInstance = new Chart(reportChart, {
            type: 'line',
            data: chartData,
            options: chartOptions
        });
    }

    // Make sure the chart container is visible
    const chartContainer = reportChart.parentElement;
    if (chartContainer) {
        chartContainer.style.display = 'block';
        chartContainer.style.height = '400px'; // Maintain the fixed height
    }
}

// Generate cash flow data (income vs expenses by month)
function generateCashFlowData() {
    // Get last 6 months
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        });
    }
    
    // Calculate income and expenses for each month
    const incomeData = [];
    const expenseData = [];
    
    months.forEach(month => {
        // Income for this month
        const monthIncome = incomes.filter(income => 
            income.date.startsWith(month.yearMonth)
        ).reduce((sum, income) => sum + income.amount, 0);
        
        // Expenses for this month
        const monthExpense = expenses.filter(expense => 
            expense.date.startsWith(month.yearMonth)
        ).reduce((sum, expense) => sum + expense.amount, 0);
        
        incomeData.push(monthIncome);
        expenseData.push(monthExpense);
    });
    
    return {
        labels: months.map(m => m.label),
        datasets: [
            {
                label: 'Income',
                data: incomeData,
                backgroundColor: 'rgba(35, 213, 255, 0.6)',
                borderColor: 'rgba(35, 213, 255, 1)',
                borderWidth: 1
            },
            {
                label: 'Expenses',
                data: expenseData,
                backgroundColor: 'rgba(255, 82, 82, 0.6)',
                borderColor: 'rgba(255, 82, 82, 1)',
                borderWidth: 1
            }
        ]
    };
}

// Generate category breakdown data (doughnut chart)
function generateCategoryBreakdownData() {
    // Get current month expenses
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthYear = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    const currentMonthExpenses = expenses.filter(expense => 
        expense.date.startsWith(monthYear)
    );
    
    // Calculate total per category
    const categoryTotals = {};
    const categoryColors = {
        food: 'rgba(255, 154, 158, 0.7)',
        transportation: 'rgba(161, 196, 253, 0.7)',
        housing: 'rgba(212, 252, 121, 0.7)',
        utilities: 'rgba(255, 236, 210, 0.7)',
        entertainment: 'rgba(132, 250, 176, 0.7)',
        education: 'rgba(194, 233, 251, 0.7)',
        other: 'rgba(221, 214, 243, 0.7)'
    };
    
    currentMonthExpenses.forEach(expense => {
        if (!categoryTotals[expense.category]) {
            categoryTotals[expense.category] = 0;
        }
        categoryTotals[expense.category] += expense.amount;
    });
    
    // Convert to chart data
    const labels = [];
    const data = [];
    const backgroundColor = [];
    
    Object.entries(categoryTotals).forEach(([category, total]) => {
        labels.push(category.charAt(0).toUpperCase() + category.slice(1));
        data.push(total);
        backgroundColor.push(categoryColors[category] || 'rgba(108, 117, 125, 0.7)');
    });
    
    return {
        labels: labels,
        datasets: [{
            data: data,
            backgroundColor: backgroundColor,
            borderWidth: 1
        }]
    };
}

// Generate savings trend data (line chart)
function generateSavingsTrendData() {
    // Get last 12 months
    const months = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
            label: d.toLocaleString('default', { month: 'short' }),
            month: d.getMonth(),
            year: d.getFullYear(),
            yearMonth: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        });
    }
    
    // Calculate savings for each month (income - expenses)
    const savingsData = [];
    let cumulativeSavings = 0;
    
    months.forEach(month => {
        // Income for this month
        const monthIncome = incomes.filter(income => 
            income.date.startsWith(month.yearMonth)
        ).reduce((sum, income) => sum + income.amount, 0);
        
        // Expenses for this month
        const monthExpense = expenses.filter(expense => 
            expense.date.startsWith(month.yearMonth)
        ).reduce((sum, expense) => sum + expense.amount, 0);
        
        const monthlySavings = monthIncome - monthExpense;
        cumulativeSavings += monthlySavings;
        savingsData.push(cumulativeSavings);
    });
    
    return {
        labels: months.map(m => m.label),
        datasets: [
            {
                label: 'Cumulative Savings',
                data: savingsData,
                backgroundColor: 'rgba(74, 107, 255, 0.2)',
                borderColor: 'rgba(74, 107, 255, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }
        ]
    };
}

// Export report to PDF
function exportReportToPdf() {
    alert('PDF export feature will be available in the next update!');
}

// Export report to CSV
function exportReportToCsv() {
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Different export based on report type
    if (currentReport === 'cash-flow') {
        // Get chart data
        const chartData = reportChartInstance.data;
        const labels = chartData.labels;
        const incomeData = chartData.datasets[0].data;
        const expenseData = chartData.datasets[1].data;
        
        // Add header
        csvContent += 'Month,Income,Expenses,Net Cash Flow\n';
        
        // Add data
        for (let i = 0; i < labels.length; i++) {
            const netCashFlow = incomeData[i] - expenseData[i];
            csvContent += `${labels[i]},${incomeData[i]},${expenseData[i]},${netCashFlow}\n`;
        }
    } 
    else if (currentReport === 'category-breakdown') {
        // Get chart data
        const chartData = reportChartInstance.data;
        const labels = chartData.labels;
        const data = chartData.datasets[0].data;
        
        // Add header
        csvContent += 'Category,Amount\n';
        
        // Add data
        for (let i = 0; i < labels.length; i++) {
            csvContent += `${labels[i]},${data[i]}\n`;
        }
    }
    else if (currentReport === 'savings-trend') {
        // Get chart data
        const chartData = reportChartInstance.data;
        const labels = chartData.labels;
        const data = chartData.datasets[0].data;
        
        // Add header
        csvContent += 'Month,Cumulative Savings\n';
        
        // Add data
        for (let i = 0; i < labels.length; i++) {
            csvContent += `${labels[i]},${data[i]}\n`;
        }
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${currentReport}-report.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
}

// Initialize dark mode
function initDarkMode() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
    
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', isDarkMode);
        
        // Update chart colors
        updateChartsForDarkMode(isDarkMode);
    });
}

// Update chart colors for dark mode
function updateChartsForDarkMode(darkMode) {
    // Set chart defaults
    Chart.defaults.color = darkMode ? '#ffffff' : '#666666';
    Chart.defaults.borderColor = darkMode ? '#333333' : '#dddddd';
    
    // Update existing charts
    if (monthlyChart) {
        monthlyChart.destroy();
        updateMonthlyChart();
    }
    
    if (categoryChart) {
        categoryChart.destroy();
        updateCategoryChart();
    }
    
    if (balanceChart) {
        balanceChart.destroy();
        updateBalanceChart();
    }
    
    if (reportChartInstance) {
        const currentType = currentReport;
        reportChartInstance.destroy();
        generateReport(currentType);
    }
}

// Initialize the application
function init() {
    // Load saved data
    const savedData = JSON.parse(localStorage.getItem('expenseTrackerData')) || {
        expenses: [],
        incomes: [],
        currencyPreference: 'INR'
    };
    
    // Initialize global variables
    expenses = savedData.expenses || [];
    incomes = savedData.incomes || [];
    selectedCurrency = savedData.currencyPreference || 'INR';
    
    // Set initial currency preference
    currencySelector.value = selectedCurrency;
    
    // Initialize dark mode
    initDarkMode();
    
    // Set default dates
    expenseDateInput.valueAsDate = new Date();
    incomeDateInput.valueAsDate = new Date();
    
    // Initialize tabs
    setupTabs();
    
    // Add event listeners
    expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    incomeForm.addEventListener('submit', handleIncomeFormSubmit);
    currencySelector.addEventListener('change', handleCurrencyChange);
    filterCategorySelect.addEventListener('change', () => {
        renderTransactions();
        updateTotalAmount();
    });
    filterMonthInput.addEventListener('change', () => {
        renderTransactions();
        updateTotalAmount();
    });
    
    // Ensure balance elements are available
    ensureBalanceElements();
    
    // Update all UI elements immediately
    updateBalanceDisplay();
    renderTransactions();
    updateAnalysis();
    updateCategoryWidgets();
    updateCategoryChart();
    
    // Initialize Money Manager features
    initMoneyManagerFeatures();
    
    // Set initial chart colors based on dark mode
    updateChartsForDarkMode(isDarkMode);
    
    // Force render all transactions by setting currentView to 'all'
    currentView = 'all';
    renderTransactions();
    
    // Force update all charts
    if (typeof Chart !== 'undefined') {
        // Make sure monthly chart canvas exists and is visible
        const monthlyChartContainer = document.querySelector('.chart-container');
        if (monthlyChartContainer) {
            monthlyChartContainer.style.display = 'block';
            monthlyChartContainer.style.height = '400px';
            monthlyChartContainer.style.marginBottom = '30px';
        }

        // Initialize monthly chart first
        updateMonthlyChart();
        
        // Update other charts
        updateCategoryChart();
        updateBalanceChart();
        generateReport('cash-flow');
    }
    
    // Make sure all chart containers are visible
    const chartContainers = document.querySelectorAll('.chart-container');
    chartContainers.forEach(container => {
        container.style.display = 'block';
        container.style.height = '400px';
    });
    
    // Make sure the transactions list is visible
    const transactionsContainer = document.querySelector('.transactions-container');
    if (transactionsContainer) {
        transactionsContainer.style.display = 'block';
    }
    
    // Make sure the analysis section is visible
    const analysisSection = document.querySelector('.analysis-container');
    if (analysisSection) {
        analysisSection.style.display = 'block';
        
        // Add analysis month filter
        const analysisTitle = analysisSection.querySelector('h2');
        if (analysisTitle) {
            const filterDiv = document.createElement('div');
            filterDiv.className = 'analysis-filter';
            filterDiv.style.marginBottom = '20px';
            filterDiv.style.display = 'flex';
            filterDiv.style.alignItems = 'center';
            filterDiv.style.gap = '10px';
            
            const label = document.createElement('label');
            label.htmlFor = 'analysis-month-filter';
            label.textContent = 'Select Month:';
            label.style.marginBottom = '0';
            
            const monthFilter = document.createElement('input');
            monthFilter.type = 'month';
            monthFilter.id = 'analysis-month-filter';
            monthFilter.className = 'form-control';
            
            // Set default value to current month
            const now = new Date();
            monthFilter.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            
            // Add event listener for filter change
            monthFilter.addEventListener('change', () => {
                updateAnalysis();
            });
            
            filterDiv.appendChild(label);
            filterDiv.appendChild(monthFilter);
            analysisTitle.insertAdjacentElement('afterend', filterDiv);
        }
    }
    
    // Make sure the monthly overview section is visible
    const monthlyOverviewContainer = document.querySelector('.chart-container');
    if (monthlyOverviewContainer) {
        monthlyOverviewContainer.style.display = 'block';
        monthlyOverviewContainer.style.visibility = 'visible';
        monthlyOverviewContainer.style.opacity = '1';
    }
    
    // Force update monthly chart again after a short delay
    setTimeout(() => {
        if (typeof Chart !== 'undefined') {
            updateMonthlyChart();
        }
    }, 100);
    
    console.log('Application initialized with:', {
        expenses: expenses.length,
        incomes: incomes.length,
        currency: selectedCurrency,
        darkMode: isDarkMode,
        savedData: savedData
    });
}

// Set up tab functionality
function setupTabs() {
    // Form tabs (Expense/Income)
    formTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            formTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => content.classList.add('hidden'));
            
            // Show selected tab content
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.remove('hidden');
        });
    });
    
    // Transaction tabs (Expenses/Income/All)
    transactionTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all transaction tabs
            transactionTabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update current view
            currentView = tab.getAttribute('data-list');
            
            // Render transactions with new view
            renderTransactions();
        });
    });
}

// Save data to localStorage
function saveData() {
    const data = {
        expenses: expenses,
        incomes: incomes,
        currencyPreference: selectedCurrency
    };
    localStorage.setItem('expenseTrackerData', JSON.stringify(data));
}

// Format currency
function formatCurrency(amount) {
    const currency = currencies[selectedCurrency];
    const formattedAmount = parseFloat(amount).toFixed(currency.decimals);
    
    if (currency.position === 'before') {
        return currency.symbol + formattedAmount;
    } else {
        return formattedAmount + ' ' + currency.symbol;
    }
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

// Handle currency change
function handleCurrencyChange(e) {
    selectedCurrency = e.target.value;
    saveData();
    renderTransactions();
    updateAnalysis();
    updateCategoryWidgets();
    updateBalanceDisplay();
}

// Handle adding or updating an expense
function handleExpenseFormSubmit(e) {
    e.preventDefault();
    
    const name = expenseNameInput.value;
    const amount = parseFloat(expenseAmountInput.value);
    const category = expenseCategoryInput.value;
    const date = expenseDateInput.value;
    
    if (!name || isNaN(amount) || !category || !date) {
        alert('Please fill in all fields correctly');
        return;
    }
    
    if (editingExpenseId) {
        // Update existing expense
        const index = expenses.findIndex(expense => expense.id === editingExpenseId);
        if (index !== -1) {
            expenses[index] = {
                ...expenses[index],
                name,
                amount,
                category,
                date
            };
        }
        editingExpenseId = null;
    } else {
        // Add new expense
        const newExpense = {
            id: Date.now().toString(),
            name,
            amount,
            category,
            date,
            currency: selectedCurrency,
            type: 'expense'
        };
        expenses.push(newExpense);
    }
    
    // Save to localStorage
    saveData();
    
    // Update UI
    renderTransactions();
    updateAnalysis();
    updateCategoryWidgets();
    updateBalanceDisplay();
    updateCategoryChart();
    
    // Reset form
    expenseForm.reset();
    expenseDateInput.valueAsDate = new Date();
    
    // Show success notification
    animateAddExpense();
    
    console.log('Expense added/updated:', { name, amount, category, date });
}

// Handle adding or updating an income
function handleIncomeFormSubmit(e) {
    e.preventDefault();
    
    const name = incomeNameInput.value;
    const amount = parseFloat(incomeAmountInput.value);
    const category = incomeCategoryInput.value;
    const date = incomeDateInput.value;
    
    if (!name || isNaN(amount) || !category || !date) {
        alert('Please fill in all fields correctly');
        return;
    }
    
    if (editingIncomeId) {
        // Update existing income
        const index = incomes.findIndex(income => income.id === editingIncomeId);
        if (index !== -1) {
            incomes[index] = {
                ...incomes[index],
                name,
                amount,
                category,
                date
            };
        }
        editingIncomeId = null;
    } else {
        // Add new income
        const newIncome = {
            id: Date.now().toString(),
            name,
            amount,
            category,
            date,
            currency: selectedCurrency,
            type: 'income'
        };
        incomes.push(newIncome);
    }
    
    // Save to localStorage
    saveData();
    
    // Update UI
    renderTransactions();
    updateAnalysis();
    updateBalanceDisplay();
    
    // Reset form
    incomeForm.reset();
    incomeDateInput.valueAsDate = new Date();
    
    // Show success notification
    const incomeTab = document.querySelector('.form-tab[data-tab="income"]');
    incomeTab.classList.add('success-pulse');
    setTimeout(() => {
        incomeTab.classList.remove('success-pulse');
    }, 1000);
}

// Delete expense
function deleteExpense(id) {
    expenses = expenses.filter(expense => expense.id !== id);
    saveData();
    renderTransactions();
    updateAnalysis();
    updateCategoryWidgets();
    updateBalanceDisplay();
}

// Edit expense
function editExpense(id) {
    const expense = expenses.find(expense => expense.id === id);
    if (!expense) return;
    
    // Switch to expense tab if not active
    formTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.form-tab[data-tab="expense"]').classList.add('active');
    tabContents.forEach(content => content.classList.add('hidden'));
    document.getElementById('expense-tab').classList.remove('hidden');
    
    // Fill form
    expenseNameInput.value = expense.name;
    expenseAmountInput.value = expense.amount;
    expenseCategoryInput.value = expense.category;
    expenseDateInput.value = expense.date;
    
    editingExpenseId = id;
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Delete income
function deleteIncome(id) {
    incomes = incomes.filter(income => income.id !== id);
    saveData();
    renderTransactions();
    updateAnalysis();
    updateBalanceDisplay();
}

// Edit income
function editIncome(id) {
    const income = incomes.find(income => income.id === id);
    if (!income) return;
    
    // Switch to income tab if not active
    formTabs.forEach(tab => tab.classList.remove('active'));
    document.querySelector('.form-tab[data-tab="income"]').classList.add('active');
    tabContents.forEach(content => content.classList.add('hidden'));
    document.getElementById('income-tab').classList.remove('hidden');
    
    // Fill form
    incomeNameInput.value = income.name;
    incomeAmountInput.value = income.amount;
    incomeCategoryInput.value = income.category;
    incomeDateInput.value = income.date;
    
    editingIncomeId = id;
    
    // Scroll to form
    document.querySelector('.form-container').scrollIntoView({ behavior: 'smooth' });
}

// Update balance display
function updateBalanceDisplay() {
    // Get selected month from filter
    const balanceMonthFilter = document.getElementById('balance-month-filter');
    const selectedDate = balanceMonthFilter.value ? new Date(balanceMonthFilter.value) : new Date();
    
    // Filter transactions for selected month
    const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedDate.getMonth() && 
               expenseDate.getFullYear() === selectedDate.getFullYear();
    });
    
    const monthIncomes = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === selectedDate.getMonth() && 
               incomeDate.getFullYear() === selectedDate.getFullYear();
    });
    
    // Calculate totals for the selected month
    const totalIncome = monthIncomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingAmount = totalIncome - totalExpenses;
    
    // Update display
    document.getElementById('total-income').textContent = formatCurrency(totalIncome);
    document.getElementById('total-expenses').textContent = formatCurrency(totalExpenses);
    
    const remainingEl = document.getElementById('remaining-amount');
    remainingEl.textContent = formatCurrency(Math.abs(remainingAmount));
    remainingEl.className = 'balance-amount ' + (remainingAmount >= 0 ? 'positive' : 'negative');
    
    // Update chart if it exists
    updateBalanceChart();
    
    // Log update for debugging
    console.log('Balance updated for:', selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
        income: formatCurrency(totalIncome),
        expenses: formatCurrency(totalExpenses),
        remaining: formatCurrency(remainingAmount)
    });
}

// Add event listener for balance month filter
document.addEventListener('DOMContentLoaded', function() {
    const balanceMonthFilter = document.getElementById('balance-month-filter');
    if (balanceMonthFilter) {
        balanceMonthFilter.addEventListener('change', function() {
            updateBalanceDisplay();
            updateBalanceChart();
        });
    }
});

// Filter expenses
function filterExpenses() {
    const categoryFilter = filterCategorySelect.value;
    const monthFilter = filterMonthInput.value;
    
    // DATA ANALYSIS: Filtering data based on multiple criteria
    return expenses.filter(expense => {
        // Filter by category
        const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
        
        // Filter by month
        let monthMatch = true;
        if (monthFilter) {
            const expenseDate = new Date(expense.date);
            const filterDate = new Date(monthFilter);
            monthMatch = expenseDate.getFullYear() === filterDate.getFullYear() && 
                         expenseDate.getMonth() === filterDate.getMonth();
        }
        
        return categoryMatch && monthMatch;
    });
}

// Render transactions based on filters and current view
function renderTransactions() {
    // Get filters
    const categoryFilter = filterCategorySelect.value;
    const monthFilter = filterMonthInput.value;
    
    // Filter expenses
    let filteredExpenses = [...expenses];
    let filteredIncomes = [...incomes];
    
    if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
        filteredIncomes = filteredIncomes.filter(income => income.category === categoryFilter);
    }
    
    if (monthFilter) {
        const monthYear = monthFilter.substring(0, 7); // Format: YYYY-MM
        filteredExpenses = filteredExpenses.filter(expense => expense.date.startsWith(monthYear));
        filteredIncomes = filteredIncomes.filter(income => income.date.startsWith(monthYear));
    }
    
    // Sort by date (newest first)
    filteredExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    filteredIncomes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Clear list
    transactionsList.innerHTML = '';
    
    // Determine which transactions to show based on current view
    let transactionsToShow = [];
    if (currentView === 'expenses') {
        transactionsToShow = filteredExpenses;
    } else if (currentView === 'income') {
        transactionsToShow = filteredIncomes;
    } else { // 'all'
        // Combine and sort by date
        transactionsToShow = [...filteredExpenses, ...filteredIncomes].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
        );
    }
    
    // Render each transaction
    transactionsToShow.forEach(transaction => {
        const li = document.createElement('li');
        li.className = `transaction ${transaction.type === 'income' ? 'income-item' : 'expense-item'}`;
        li.dataset.id = transaction.id;
        li.dataset.type = transaction.type;
        
        const transactionInfo = document.createElement('div');
        transactionInfo.className = 'transaction-info';
        
        const nameEl = document.createElement('strong');
        nameEl.textContent = transaction.name;
        
        const categoryEl = document.createElement('span');
        categoryEl.className = `category ${transaction.category}`;
        categoryEl.textContent = transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1);
        
        const amountEl = document.createElement('span');
        amountEl.className = `amount ${transaction.type === 'income' ? 'income-amount' : 'expense-amount'}`;
        amountEl.textContent = formatCurrency(transaction.amount);
        
        const dateEl = document.createElement('span');
        dateEl.className = 'date';
        dateEl.textContent = formatDate(transaction.date);
        
        const actions = document.createElement('div');
        actions.className = 'actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn btn-action';
        editBtn.innerHTML = '<i class="fas fa-edit"></i> Edit';
        editBtn.addEventListener('click', () => {
            if (transaction.type === 'expense') {
                editExpense(transaction.id);
            } else {
                editIncome(transaction.id);
            }
        });
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn btn-action';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i> Delete';
        deleteBtn.addEventListener('click', () => {
            // Show confirmation dialog
            const confirmDelete = confirm(`Are you sure you want to delete this ${transaction.type}?\n\nName: ${transaction.name}\nAmount: ${formatCurrency(transaction.amount)}\nCategory: ${transaction.category}\nDate: ${formatDate(transaction.date)}`);
            
            if (confirmDelete) {
                if (transaction.type === 'expense') {
                    deleteExpense(transaction.id);
                } else {
                    deleteIncome(transaction.id);
                }
                // Add animation to the deleted item
                li.classList.add('slide-out');
                
                // Update all relevant displays
                setTimeout(() => {
                    updateAnalysis();
                    updateCategoryChart();
                    updateCategoryWidgets();
                    updateBalanceDisplay();
                    updateMonthlyChart();
                }, 300);
            }
        });
        
        transactionInfo.appendChild(nameEl);
        transactionInfo.appendChild(categoryEl);
        transactionInfo.appendChild(dateEl);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        
        li.appendChild(transactionInfo);
        li.appendChild(amountEl);
        li.appendChild(actions);
        
        // Add animation class for new items
        li.classList.add('fade-in');
        
        transactionsList.appendChild(li);
    });
    
    // Update total amount
    updateTotalAmount();
}

// Update category widgets with latest data
function updateCategoryWidgets() {
    // Get selected month from filter
    const filterMonth = document.getElementById('filter-month');
    const selectedDate = filterMonth.value ? new Date(filterMonth.value) : new Date();
    const selectedMonth = selectedDate.getMonth();
    const selectedYear = selectedDate.getFullYear();
    
    // Get selected month expenses
    const selectedMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedDate.getMonth() && 
               expenseDate.getFullYear() === selectedDate.getFullYear();
    });
    
    // Get previous month
    const prevDate = new Date(selectedYear, selectedMonth - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();
    
    // Get previous month expenses
    const prevMonthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === prevMonth && expenseDate.getFullYear() === prevYear;
    });
    
    // Calculate category totals for selected month
    const currentCategoryTotals = {};
    Object.keys(categoryAmountElements).forEach(category => {
        currentCategoryTotals[category] = selectedMonthExpenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    // Calculate category totals for previous month
    const prevCategoryTotals = {};
    Object.keys(categoryAmountElements).forEach(category => {
        prevCategoryTotals[category] = prevMonthExpenses
            .filter(expense => expense.category === category)
            .reduce((sum, expense) => sum + expense.amount, 0);
    });
    
    // Update category amount and trend elements
    Object.keys(categoryAmountElements).forEach(category => {
        // Update amount display
        if (categoryAmountElements[category]) {
        categoryAmountElements[category].textContent = formatCurrency(currentCategoryTotals[category]);
        }
        
        // Calculate and update trend
        if (categoryTrendElements[category]) {
        const currentTotal = currentCategoryTotals[category] || 0;
        const prevTotal = prevCategoryTotals[category] || 0;
        let trendEl = categoryTrendElements[category];
        trendEl.innerHTML = ''; // Clear existing content
        
        if (prevTotal === 0) {
                if (currentTotal === 0) {
                    trendEl.innerHTML = '<span class="neutral">-</span>';
                } else {
            trendEl.innerHTML = '<span class="neutral">New</span>';
                }
        } else {
            const percentChange = ((currentTotal - prevTotal) / prevTotal) * 100;
            if (percentChange > 0) {
                trendEl.innerHTML = `<span class="up">▲ ${percentChange.toFixed(1)}%</span>`;
            } else if (percentChange < 0) {
                trendEl.innerHTML = `<span class="down">▼ ${Math.abs(percentChange).toFixed(1)}%</span>`;
            } else {
                trendEl.innerHTML = '<span class="neutral">-</span>';
                }
            }
        }
    });
    
    // Log update for debugging
    console.log('Category widgets updated for:', selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
        currentTotals: currentCategoryTotals,
        previousTotals: prevCategoryTotals
    });
}

// Update total amount based on filters
function updateTotalAmount() {
    // Get filters
    const categoryFilter = filterCategorySelect.value;
    const monthFilter = filterMonthInput.value;
    
    // Filter expenses
    let filteredExpenses = [...expenses];
    
    if (categoryFilter !== 'all') {
        filteredExpenses = filteredExpenses.filter(expense => expense.category === categoryFilter);
    }
    
    if (monthFilter) {
        const monthYear = monthFilter.substring(0, 7); // Format: YYYY-MM
        filteredExpenses = filteredExpenses.filter(expense => expense.date.startsWith(monthYear));
    }
    
    // Calculate total
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Update UI
    totalAmountElement.textContent = formatCurrency(total);
}

// Update analysis section
function updateAnalysis() {
    const filterMonth = document.getElementById('filter-month');
    const selectedDate = filterMonth.value ? new Date(filterMonth.value) : new Date();
    
    // Filter expenses for selected month
    const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedDate.getMonth() && 
               expenseDate.getFullYear() === selectedDate.getFullYear();
    });

    // Calculate average daily expenses for the selected month only
    const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
    const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgDaily = monthExpenses.length > 0 ? totalExpenses / daysInMonth : 0;
    document.getElementById('avg-daily').textContent = formatCurrency(avgDaily);

    // Find highest expense for the selected month only
    const highestExpense = monthExpenses.length > 0 ? 
        Math.max(...monthExpenses.map(expense => expense.amount)) : 0;
    document.getElementById('highest-expense').textContent = formatCurrency(highestExpense);

    // Find most expensive category for the selected month only
        const categoryTotals = {};
    monthExpenses.forEach(expense => {
        categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });

    const mostExpensiveCategory = monthExpenses.length > 0 ? 
        Object.entries(categoryTotals).reduce((max, [category, amount]) => 
            amount > (max.amount || 0) ? {category, amount} : max, {}).category || 'None' : 'None';
    
    document.getElementById('expensive-category').textContent = 
        mostExpensiveCategory === 'None' ? 'None' : mostExpensiveCategory.charAt(0).toUpperCase() + mostExpensiveCategory.slice(1);

    // Update category chart for the selected month
    updateCategoryChart();
    updateCategoryWidgets();
    
    // Log for debugging
    console.log('Analysis updated for:', selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
        totalExpenses: formatCurrency(totalExpenses),
        avgDaily: formatCurrency(avgDaily),
        highestExpense: formatCurrency(highestExpense),
        mostExpensiveCategory: mostExpensiveCategory,
        numberOfTransactions: monthExpenses.length
    });
}

// Update the event listeners to ensure all components update together
document.getElementById('filter-month').addEventListener('change', function() {
    updateAnalysis();
    updateCategoryChart();
    updateCategoryWidgets();
    renderTransactions();
    updateTotalAmount();
});

// Update monthly chart
function updateMonthlyChart() {
    const monthlyChartCanvas = document.getElementById('monthly-chart');
    if (!monthlyChartCanvas) {
        console.error('Monthly chart canvas not found');
        return;
    }

    // Make sure the container is visible
    const container = monthlyChartCanvas.parentElement;
    if (container) {
        container.style.display = 'block';
        container.style.visibility = 'visible';
        container.style.height = '400px';
    }

    // Destroy existing chart if it exists
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    // Get the last 6 months
    const labels = [];
    const expenseData = [];
    const incomeData = [];
    
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
        const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        labels.push(monthLabel);
        
        // Calculate expenses for month
        const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
        const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
        
        const monthExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate >= monthStart && expenseDate <= monthEnd;
        });
        
        const monthIncome = incomes.filter(income => {
            const incomeDate = new Date(income.date);
            return incomeDate >= monthStart && incomeDate <= monthEnd;
        });
        
        const totalExpenses = monthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        const totalIncome = monthIncome.reduce((sum, income) => sum + income.amount, 0);

        expenseData.push(totalExpenses);
        incomeData.push(totalIncome);
    }

    // Create chart with improved visibility
    monthlyChart = new Chart(monthlyChartCanvas, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(35, 213, 255, 0.1)',
                    borderColor: 'rgba(35, 213, 255, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(35, 213, 255, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 82, 82, 0.1)',
                    borderColor: 'rgba(255, 82, 82, 1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(255, 82, 82, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        },
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    padding: 12,
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkMode ? '#fff' : '#000',
                    titleFont: {
                        size: 14,
                        weight: 'bold'
                    },
                    bodyColor: isDarkMode ? '#fff' : '#000',
                    bodyFont: {
                        size: 13
                    },
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.raw;
                            return label + ': ' + formatCurrency(value);
                        }
                    }
                }
            }
        }
    });

    // Log successful chart creation
    console.log('Monthly chart updated successfully');
}

// Update category chart
function updateCategoryChart() {
    const categoryChartCanvas = document.getElementById('category-chart');
    if (!categoryChartCanvas) {
        console.error('Category chart canvas not found');
        return;
    }

    // Get selected month/year from filter
    const filterMonth = document.getElementById('filter-month');
    const selectedDate = filterMonth.value ? new Date(filterMonth.value) : new Date();

    // Filter expenses for selected month only
    const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === selectedDate.getMonth() && 
               expenseDate.getFullYear() === selectedDate.getFullYear();
    });

    // Calculate totals for each category for the selected month only
    const categoryTotals = {
        food: 0,
        transportation: 0,
        housing: 0,
        utilities: 0,
        entertainment: 0,
        education: 0,
        other: 0
    };

    monthExpenses.forEach(expense => {
        if (categoryTotals.hasOwnProperty(expense.category)) {
            categoryTotals[expense.category] += expense.amount;
        }
    });

    // Prepare data for chart
    const labels = Object.keys(categoryTotals).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
    const data = Object.values(categoryTotals);
    const backgroundColors = [
        'rgba(255, 99, 132, 0.8)',  // Food
        'rgba(54, 162, 235, 0.8)',  // Transportation
        'rgba(255, 206, 86, 0.8)',  // Housing
        'rgba(75, 192, 192, 0.8)',  // Utilities
        'rgba(153, 102, 255, 0.8)', // Entertainment
        'rgba(255, 159, 64, 0.8)',  // Education
        'rgba(199, 199, 199, 0.8)'  // Other
    ];

    // Destroy existing chart if it exists
    if (window.categoryChart) {
        window.categoryChart.destroy();
    }

    // Create new chart
    window.categoryChart = new Chart(categoryChartCanvas, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
                borderWidth: 1,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: {
                padding: 20
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        },
                        color: isDarkMode ? '#ffffff' : '#2d3748'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    },
                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                    titleColor: isDarkMode ? '#fff' : '#000',
                    bodyColor: isDarkMode ? '#fff' : '#000',
                    borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                    borderWidth: 1
                }
            }
        }
    });

    // Update category amounts in widgets
    Object.keys(categoryTotals).forEach(category => {
        const amountElement = document.getElementById(`${category}-amount`);
        if (amountElement) {
            amountElement.textContent = formatCurrency(categoryTotals[category]);
        }
    });

    // Log update for debugging
    console.log('Category chart updated for:', selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), {
        totals: categoryTotals,
        totalExpenses: Object.values(categoryTotals).reduce((a, b) => a + b, 0)
    });
}

// Update balance chart
function updateBalanceChart() {
    // Check if balance chart canvas exists
    if (!balanceChartCanvas) {
        balanceChartCanvas = document.getElementById('balance-chart');
        if (!balanceChartCanvas) {
            console.warn("Balance chart canvas not found");
            return;
        }
    }
    
    if (balanceChart !== null) {
        balanceChart.destroy();
    }
    
    // Calculate total income and expenses
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Check if we have data to display
    if (totalIncome === 0 && totalExpenses === 0) {
        console.log("No income or expense data to display in balance chart");
        return;
    }
    
    // Create chart
    try {
        balanceChart = new Chart(balanceChartCanvas, {
            type: 'pie',
            data: {
                labels: ['Income', 'Expenses'],
                datasets: [{
                    data: [totalIncome, totalExpenses],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.8)',
                        'rgba(255, 99, 132, 0.8)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 2,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: 20
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return label + ': ' + formatCurrency(value) + ' (' + percentage + '%)';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error creating balance chart:", error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    
    // Ensure balance elements are acquired
    if (!incomeTotalElement || !expensesTotalElement || !remainingTotalElement) {
        incomeTotalElement = document.getElementById('income-total');
        expensesTotalElement = document.getElementById('expenses-total');
        remainingTotalElement = document.getElementById('remaining-total');
        console.log("Initializing balance elements:", incomeTotalElement, expensesTotalElement, remainingTotalElement);
    }
    
    // Initialize app
    init();
    
    // Initialize Money Manager features with a delay to ensure DOM is ready
    setTimeout(() => {
        initMoneyManagerFeatures();
    }, 100);
    
    // Add event listeners for report tabs
    reportTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            reportTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentReport = tab.dataset.report;
            generateReport(currentReport);
        });
    });
    
    // Event listener for expense form
    expenseForm.addEventListener('submit', handleExpenseFormSubmit);
    
    // Event listener for income form
    incomeForm.addEventListener('submit', handleIncomeFormSubmit);
    
    // Event listener for filter changes
    filterCategorySelect.addEventListener('change', () => {
        renderTransactions();
        updateTotalAmount();
    });
    
    filterMonthInput.addEventListener('change', () => {
        renderTransactions();
        updateTotalAmount();
    });
    
    // Event listener for currency selector
    currencySelector.addEventListener('change', handleCurrencyChange);
    
    // Event listener for refresh balance button
    if (refreshBalanceBtn) {
        refreshBalanceBtn.addEventListener('click', () => {
            updateBalanceDisplay();
            refreshBalanceBtn.classList.add('rotate');
            setTimeout(() => {
                refreshBalanceBtn.classList.remove('rotate');
            }, 1000);
        });
    }
    
    // Initialize charts if Chart.js is available
    if (typeof Chart !== 'undefined') {
        updateMonthlyChart();
        updateCategoryChart();
        updateBalanceChart();
    } else {
        console.warn('Chart.js is not loaded. Charts will not be displayed.');
    }
});

// Add animation when expense is added
function animateAddExpense() {
    const expenseTab = document.querySelector('.form-tab[data-tab="expense"]');
    expenseTab.classList.add('success-pulse');
    setTimeout(() => {
        expenseTab.classList.remove('success-pulse');
    }, 1000);
    
    const categories = document.querySelector('.category-widgets');
    categories.classList.add('shimmer');
    setTimeout(() => {
        categories.classList.remove('shimmer');
    }, 1000);
}

// Add animations when elements are added or deleted
function setupAnimationObserver() {
    // Create an observer instance
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                // New nodes added
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1 && node.classList.contains('transaction')) {
                        node.classList.add('fade-in');
                        setTimeout(() => {
                            node.classList.remove('fade-in');
                        }, 1000);
                    }
                });
            }
        });
    });
    
    // Start observing the target node
    observer.observe(transactionsList, { childList: true });
}

// Call setup for animations
setupAnimationObserver(); 

// Ensure balance elements are available 
function ensureBalanceElements() {
    if (!incomeTotalElement || !expensesTotalElement || !remainingTotalElement) {
        incomeTotalElement = document.getElementById('income-total');
        expensesTotalElement = document.getElementById('expenses-total');
        remainingTotalElement = document.getElementById('remaining-total');
    }
    return (incomeTotalElement && expensesTotalElement && remainingTotalElement);
}

// Update all charts at once
function updateCharts() {
    if (typeof Chart !== 'undefined') {
        updateMonthlyChart();
        updateCategoryChart();
        updateBalanceChart();
    } else {
        console.error('Chart.js is not loaded. Please ensure Chart.js is properly included.');
    }
}

// Add event listeners for updates
function setupChartUpdates() {
    // Update charts when filter month changes
    const filterMonth = document.getElementById('filter-month');
    if (filterMonth) {
        filterMonth.addEventListener('change', () => {
            updateCategoryChart();
            updateMonthlyChart();
            updateBalanceChart();
        });
    }

    // Update all charts after adding new transaction
    function updateAllCharts() {
        updateCategoryChart();
        updateMonthlyChart();
        updateBalanceChart();
        updateAnalysis();
    }

    // Add event listeners to forms
    const expenseForm = document.getElementById('expense-form');
    const incomeForm = document.getElementById('income-form');

    if (expenseForm) {
        expenseForm.addEventListener('submit', () => {
            setTimeout(updateAllCharts, 100);
        });
    }

    if (incomeForm) {
        incomeForm.addEventListener('submit', () => {
            setTimeout(updateAllCharts, 100);
        });
    }
}

// Call setup function during initialization
document.addEventListener('DOMContentLoaded', () => {
    setupChartUpdates();
}); 