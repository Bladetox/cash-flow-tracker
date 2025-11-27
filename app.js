// CashFlow Partner - Your Business Companion
// Premium cash flow management with Google integration (simulated)
// All data is stored in memory (no localStorage due to sandbox restrictions)

const APP_STATE = {
  webAppUrl: null,
  syncStatus: 'not_connected',
  sheetsSync: {
    enabled: true,
    lastSync: null,
    status: 'ready'
  },
  motivationalTips: [
    'Healthy cash flow = Business growth 📈',
    'Every transaction tracked is money managed 💰',
    'You\'re building better financial habits 🎯',
    'Small discipline = Big success 🌟',
    'Your data is your business intelligence 📊',
    'Track today, grow tomorrow 🚀',
    'Knowledge is power - you\'ve got this 💪'
  ],
  currentTipIndex: 0,
  transactionCount: 0,
  trackingStreak: 0,
  currentView: 'dashboard',
  currentDate: new Date(), // Default to current date
  minimumThreshold: 200,
  categories: [
    { name: 'Sales/Income', color: '#208051', icon: '💵' },
    { name: 'Merchandise/Stock', color: '#2180A1', icon: '🛍️' },
    { name: 'Transport', color: '#A84F2F', icon: '🚌' },
    { name: 'Airtime/Data', color: '#C04F1F', icon: '📱' },
    { name: 'Rent', color: '#A8531F', icon: '🏠' },
    { name: 'Personal', color: '#8B5A2B', icon: '👤' },
    { name: 'Other', color: '#696969', icon: '📋' }
  ],
  transactions: [],
  openingBalances: {} // Format: { 'YYYY-MM-DD': balance }
};

// Google Sheets Sync via Web App URL
function syncToGoogleSheets(transaction) {
  const webAppUrl = APP_STATE.webAppUrl;
  if (!webAppUrl) {
    console.log('No Web App URL configured, skipping sync');
    return;
  }
  
  const dateKey = getDateKey(APP_STATE.currentDate);
  const balance = calculateClosingBalance(dateKey);
  
  const payload = {
    date: transaction.date,
    time: transaction.time,
    description: transaction.description,
    category: transaction.category,
    amountIn: transaction.amountIn,
    amountOut: transaction.amountOut,
    balance: balance
  };
  
  APP_STATE.syncStatus = 'syncing';
  
  fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
  .then(() => {
    console.log('✓ Synced to Google Sheets');
    APP_STATE.syncStatus = 'connected';
    APP_STATE.sheetsSync.lastSync = new Date();
    showSyncMessage('✓ Synced to Google Sheets', 'success');
  })
  .catch(error => {
    console.log('⚠️ Sync failed:', error);
    APP_STATE.syncStatus = 'error';
    showSyncMessage('⚠️ Sync failed - check connection', 'error');
  });
}

function showSyncMessage(message, type) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  if (type === 'error') {
    toast.style.background = 'var(--color-error)';
  }
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function testConnection() {
  const webAppUrl = APP_STATE.webAppUrl;
  if (!webAppUrl) {
    showToast('⚠️ Please enter a Web App URL first');
    return;
  }
  
  showToast('Testing connection...');
  
  const testPayload = {
    date: getDateKey(new Date()),
    time: new Date().toTimeString().substring(0, 5),
    description: 'Test Connection',
    category: 'Other',
    amountIn: 0,
    amountOut: 0,
    balance: 0
  };
  
  fetch(webAppUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testPayload)
  })
  .then(() => {
    APP_STATE.syncStatus = 'connected';
    APP_STATE.sheetsSync.lastSync = new Date();
    showToast('✓ Connection successful!');
    switchView('settings');
  })
  .catch(error => {
    APP_STATE.syncStatus = 'error';
    showToast('⚠️ Connection failed - check your URL');
  });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'success-toast';
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function getRandomTip() {
  const tip = APP_STATE.motivationalTips[APP_STATE.currentTipIndex];
  APP_STATE.currentTipIndex = (APP_STATE.currentTipIndex + 1) % APP_STATE.motivationalTips.length;
  return tip;
}

function calculateCashHealth() {
  const dateKey = getDateKey(APP_STATE.currentDate);
  const currentBalance = calculateClosingBalance(dateKey);
  const threshold = APP_STATE.minimumThreshold;
  
  if (currentBalance >= threshold * 3) {
    return { percentage: 100, status: 'Excellent', class: 'excellent', emoji: '🎉' };
  } else if (currentBalance >= threshold * 2) {
    return { percentage: 80, status: 'Good', class: 'good', emoji: '✅' };
  } else if (currentBalance >= threshold) {
    return { percentage: 50, status: 'Fair', class: 'warning', emoji: '⚠️' };
  } else {
    return { percentage: 25, status: 'Low', class: 'critical', emoji: '🚨' };
  }
}

// Utility functions
function formatDate(date) {
  const d = new Date(date);
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('en-ZA', options);
}

function formatDateShort(date) {
  const d = new Date(date);
  return d.toLocaleDateString('en-ZA');
}

function getDateKey(date) {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
}

function formatCurrency(amount) {
  return 'R ' + amount.toFixed(2);
}

function getOpeningBalance(dateKey) {
  return APP_STATE.openingBalances[dateKey] || 0;
}

function getTransactionsForDate(dateKey) {
  return APP_STATE.transactions.filter(t => t.date === dateKey);
}

function calculateClosingBalance(dateKey) {
  const opening = getOpeningBalance(dateKey);
  const transactions = getTransactionsForDate(dateKey);
  let balance = opening;
  transactions.forEach(t => {
    balance += t.amountIn - t.amountOut;
  });
  return balance;
}

function getBalanceClass(balance) {
  if (balance >= APP_STATE.minimumThreshold * 2) return 'threshold-ok';
  if (balance >= APP_STATE.minimumThreshold) return 'threshold-warn';
  return 'threshold-crit';
}

// Main render function
function render() {
  switchView(APP_STATE.currentView);
}

// View rendering functions
function renderDashboard() {
  const dateKey = getDateKey(APP_STATE.currentDate);
  const openingBalance = getOpeningBalance(dateKey);
  const currentBalance = calculateClosingBalance(dateKey);
  const balanceClass = getBalanceClass(currentBalance);
  const transactions = getTransactionsForDate(dateKey);
  const hasAnyData = APP_STATE.transactions.length > 0 || Object.keys(APP_STATE.openingBalances).length > 0;
  const health = calculateCashHealth();
  
  const todayTransactions = getTransactionsForDate(dateKey);
  const todayIncome = todayTransactions.reduce((sum, t) => sum + t.amountIn, 0);
  const todayExpenses = todayTransactions.reduce((sum, t) => sum + t.amountOut, 0);
  
  const recentThree = todayTransactions.slice(-3).reverse();
  
  return `
    <div class="app-header fade-in">
      <div class="user-greeting">
        <div class="greeting-text">
          <h2>CashFlow Partner</h2>
          <p>${formatDate(APP_STATE.currentDate)}</p>
        </div>
      </div>
      ${APP_STATE.syncStatus === 'connected' ? `
        <div class="sync-indicator">
          <span>✓</span>
          <span>Synced</span>
        </div>
      ` : ''}
    </div>
    
    <div class="health-gauge slide-up">
      <div class="health-label">Cash Health</div>
      <div class="gauge-container">
        <div class="gauge-bar">
          <div class="gauge-fill ${health.class}" style="width: ${health.percentage}%"></div>
        </div>
      </div>
      <div class="health-status">${health.emoji} ${health.status} - ${formatCurrency(currentBalance)}</div>
    </div>
    
    <div class="quick-snapshot slide-up">
      <div class="snapshot-title">📸 Today's Quick Snapshot</div>
      <div class="snapshot-content">
        ${todayIncome > 0 || todayExpenses > 0 ? 
          `You've made <strong>${formatCurrency(todayIncome)}</strong> in sales today. Expenses: <strong>${formatCurrency(todayExpenses)}</strong>.` :
          `No transactions recorded yet today. Start tracking your first sale!`
        }
      </div>
    </div>
    
    <div class="smart-insight slide-up">
      <div class="insight-icon">💚</div>
      <div class="insight-text">
        <strong>Smart Insight:</strong> ${health.status === 'Excellent' ? 
          `Amazing! You're well above your safety threshold. Keep up the great work!` :
          health.status === 'Good' ?
          `You're on track! Your cash flow is healthy and stable.` :
          health.status === 'Fair' ?
          `Watch your spending. You're approaching your minimum threshold.` :
          `Alert: Cash is running low. Consider reducing expenses or boosting sales.`
        }
      </div>
    </div>
    
    <div class="action-buttons slide-up">
      <button class="btn btn--primary btn-action-primary" onclick="openAddTransaction('in')">
        <span class="emoji">💵</span>
        <span>Record Sale</span>
      </button>
      <button class="btn btn--secondary btn-action-primary" onclick="openAddTransaction('out')">
        <span class="emoji">💳</span>
        <span>Log Expense</span>
      </button>
    </div>
    
    ${recentThree.length > 0 ? `
      <div class="recent-preview slide-up">
        <h3>Recent Transactions</h3>
        ${recentThree.map(t => `
          <div class="transaction-item">
            <div class="transaction-info">
              <div class="transaction-desc">${t.description}</div>
              <div class="transaction-meta">${t.time} • ${t.category}</div>
            </div>
            <div class="transaction-amount ${t.amountIn > 0 ? 'income' : 'expense'}">
              ${t.amountIn > 0 ? '+' : '-'}${formatCurrency(t.amountIn > 0 ? t.amountIn : t.amountOut)}
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="card slide-up">
        <div class="card__body" style="text-align: center;">
          ${!hasAnyData ? `
            <p style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Let's get started! Set your opening balance to begin tracking.</p>
            <button class="btn btn--outline btn--full-width" onclick="setOpeningBalance()">Set Opening Balance</button>
          ` : `
            <p style="color: var(--color-text-secondary);">No transactions yet today. Add your first one above!</p>
          `}
        </div>
      </div>
    `}
    
    <div class="motivational-tip slide-up">
      💡 ${getRandomTip()}
    </div>
    
    <div style="height: 40px;"></div>
  `;
}

function renderInsights() {
  const allTransactions = APP_STATE.transactions;
  const totalTransactions = allTransactions.length;
  
  if (totalTransactions === 0) {
    return `
      <div style="margin-top: var(--space-24); margin-bottom: var(--space-16);" class="fade-in">
        <h2>💡 Business Insights</h2>
        <p style="color: var(--color-text-secondary);">Smart analytics to grow your business</p>
      </div>
      
      <div class="insight-card slide-up" style="text-align: center; padding: var(--space-32);">
        <div style="font-size: 48px; margin-bottom: var(--space-16);">📊</div>
        <h3 style="margin-bottom: var(--space-12);">No Data Yet</h3>
        <p style="color: var(--color-text-secondary); margin-bottom: var(--space-24);">Add transactions to see insights and analytics about your business.</p>
        <button class="btn btn--primary" onclick="switchView('dashboard')">Go to Dashboard</button>
      </div>
      <div style="height: 80px;"></div>
    `;
  }
  
  const currentMonth = getDateKey(APP_STATE.currentDate).substring(0, 7);
  const monthTransactions = allTransactions.filter(t => t.date.startsWith(currentMonth));
  const monthIncome = monthTransactions.reduce((sum, t) => sum + t.amountIn, 0);
  const monthExpenses = monthTransactions.reduce((sum, t) => sum + t.amountOut, 0);
  
  // Calculate weekly trend (last 7 days vs previous 7 days)
  const today = new Date();
  const last7Days = [];
  const prev7Days = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    last7Days.push(getDateKey(day));
    
    const prevDay = new Date(today);
    prevDay.setDate(today.getDate() - i - 7);
    prev7Days.push(getDateKey(prevDay));
  }
  
  const lastWeekSales = allTransactions
    .filter(t => last7Days.includes(t.date))
    .reduce((sum, t) => sum + t.amountIn, 0);
  
  const prevWeekSales = allTransactions
    .filter(t => prev7Days.includes(t.date))
    .reduce((sum, t) => sum + t.amountIn, 0);
  
  const weekTrend = prevWeekSales > 0 
    ? Math.round(((lastWeekSales - prevWeekSales) / prevWeekSales) * 100)
    : 0;
  
  const categoryTotals = {};
  APP_STATE.categories.forEach(cat => { categoryTotals[cat.name] = 0; });
  monthTransactions.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.amountOut;
    }
  });
  
  const topCategory = Object.entries(categoryTotals)
    .filter(([name]) => name !== 'Sales/Income')
    .sort((a, b) => b[1] - a[1])[0];
  
  const avgDailyIncome = monthIncome / new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const projectedMonthEnd = avgDailyIncome * daysInMonth;
  
  const topExpenseCategory = topCategory ? topCategory[0] : null;
  const topExpenseAmount = topCategory ? topCategory[1] : 0;
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: var(--space-16);" class="fade-in">
      <h2>💡 Business Insights</h2>
      <p style="color: var(--color-text-secondary);">Smart analytics to grow your business</p>
    </div>
    
    <div class="insight-card slide-up">
      <h4>📊 Weekly Trend Analysis</h4>
      <div class="insight-card-content">
        ${weekTrend > 0 ? 
          `<strong style="color: var(--income-green);">Your sales are UP ${weekTrend}% this week! 📈</strong><br>Keep up the excellent work. You're generating strong positive momentum.` :
          weekTrend < 0 ?
          `<strong style="color: var(--expense-orange);">Sales are DOWN ${Math.abs(weekTrend)}% this week. 📉</strong><br>Focus on boosting sales and attracting more customers.` :
          `<strong>Sales are stable this week.</strong><br>Maintain consistency while looking for growth opportunities.`
        }
      </div>
    </div>
    
    <div class="insight-card slide-up">
      <h4>💡 Spending Patterns</h4>
      <div class="insight-card-content">
        ${topExpenseCategory && monthExpenses > 0 ? 
          `<strong>${topExpenseCategory}</strong> accounts for ${Math.round((topExpenseAmount/monthExpenses) * 100)}% of your expenses (${formatCurrency(topExpenseAmount)}).<br><br>This is your largest spending category this month.` :
          `Start tracking expenses to see your spending patterns and identify savings opportunities.`
        }
      </div>
    </div>
    
    <div class="insight-card slide-up">
      <h4>⚠️ Smart Alerts</h4>
      <div class="insight-card-content">
        ${lastWeekSales < prevWeekSales && prevWeekSales > 0 ?
          `<strong style="color: var(--color-warning);">⚠️ You spent more on ${topExpenseCategory || 'expenses'} this week</strong><br>Review your spending and look for ways to optimize costs.` :
          monthExpenses > monthIncome ?
          `<strong style="color: var(--color-warning);">⚠️ Monthly expenses exceed income</strong><br>Consider reducing costs or boosting sales to improve cash flow.` :
          `<strong style="color: var(--color-success);">✓ Your finances look healthy</strong><br>Keep up the great work managing your cash flow!`
        }
      </div>
    </div>
    
    <div class="insight-card slide-up">
      <h4>💰 Savings Recommendations</h4>
      <div class="insight-card-content">
        ${topExpenseCategory && topExpenseAmount > 0 ? 
          `💡 If you cut one ${topExpenseCategory.toLowerCase()} expense, you'd save approximately <strong>${formatCurrency(topExpenseAmount / monthTransactions.filter(t => t.category === topExpenseCategory).length)}</strong> per transaction.<br><br>Small changes add up to big savings!` :
          `Track more expenses to receive personalized savings recommendations.`
        }
      </div>
    </div>
    
    <div class="insight-card slide-up">
      <h4>📈 Financial Forecast</h4>
      <div class="insight-card-content">
        ${avgDailyIncome > 0 ? 
          `At your current rate of <strong>${formatCurrency(avgDailyIncome)}</strong> per day, you'll have approximately <strong>${formatCurrency(projectedMonthEnd)}</strong> in total income by month-end.<br><br>Net profit projection: <strong>${formatCurrency(projectedMonthEnd - monthExpenses)}</strong>` :
          `Track more sales to generate accurate income forecasts for your business.`
        }
      </div>
    </div>
    
    ${totalTransactions >= 10 ? `
      <div class="insight-card slide-up" style="background: var(--color-bg-5); border-color: var(--color-primary);">
        <h4>🎉 Milestone Achieved!</h4>
        <div class="insight-card-content">
          <strong>You've tracked ${totalTransactions} transactions!</strong><br>
          You're building excellent financial habits.
          <div class="milestone-badge">
            <span>🏆</span>
            <span>Dedicated Tracker</span>
          </div>
        </div>
      </div>
    ` : ''}
    
    <div class="insight-card slide-up">
      <h4>📅 Your Tracking Journey</h4>
      <div class="insight-card-content">
        You're building better financial habits! You've tracked <strong>${totalTransactions}</strong> transaction${totalTransactions !== 1 ? 's' : ''}.<br><br>
        Keep tracking daily to maintain your momentum and gain better insights.
        <div class="milestone-badge">
          <span>🔥</span>
          <span>${totalTransactions} transaction${totalTransactions !== 1 ? 's' : ''} tracked</span>
        </div>
      </div>
    </div>
    
    <div style="height: 80px;"></div>
  `;
}

function renderTransactionsList(transactions, dateKey) {
  let runningBalance = getOpeningBalance(dateKey);
  const rows = transactions.map((t, idx) => {
    runningBalance += t.amountIn - t.amountOut;
    // Create unique ID for transaction to ensure proper deletion
    const txId = `${dateKey}-${idx}`;
    return `
      <tr>
        <td style="width: 60px;">${t.time}</td>
        <td>
          <div style="font-weight: 500;">${t.description}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">${t.category}</div>
        </td>
        <td style="text-align: right; width: 90px; white-space: nowrap; font-weight: 500;">
          ${t.amountIn > 0 ? '<span style="color: var(--color-success);">+' + formatCurrency(t.amountIn) + '</span>' : ''}
          ${t.amountOut > 0 ? '<span style="color: var(--color-error);">-' + formatCurrency(t.amountOut) + '</span>' : ''}
        </td>
        <td style="text-align: right; width: 85px; white-space: nowrap;">${formatCurrency(runningBalance)}</td>
        <td style="text-align: center; width: 40px;">
          <button class="cb-action-btn delete-btn" data-date="${dateKey}" data-index="${idx}" aria-label="Delete transaction">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
  
  return `
    <table class="cashbook-table">
      <thead>
        <tr>
          <th>Time</th>
          <th>Description</th>
          <th style="text-align: right;">Amount</th>
          <th style="text-align: right;">Balance</th>
          <th style="text-align: center;"></th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderCashBook() {
  const dateKey = getDateKey(APP_STATE.currentDate);
  const transactions = getTransactionsForDate(dateKey);
  const openingBalance = getOpeningBalance(dateKey);
  const closingBalance = calculateClosingBalance(dateKey);
  const totalIn = transactions.reduce((sum, t) => sum + t.amountIn, 0);
  const totalOut = transactions.reduce((sum, t) => sum + t.amountOut, 0);
  const netCashFlow = totalIn - totalOut;
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: var(--space-16);">
      <h2>Daily Cash Book</h2>
      <div class="d-flex" style="margin-top: var(--space-16); justify-content: space-between;">
        <label for="datePicker" class="form-label" style="margin: 0;">Select Date:</label>
        <input type="date" id="datePicker" class="form-control" style="max-width: 180px;" value="${dateKey}" onchange="changeDate(this.value)">
      </div>
    </div>
    
    ${transactions.length > 0 ? renderTransactionsList(transactions, dateKey) : '<p style="text-align: center; color: var(--color-text-secondary); margin-bottom: 30px; padding-bottom: var(--space-16);">No transactions for this date.</p>'}
    
    <div class="card" style="margin-top: 30px; margin-bottom: 30px;">
      <div class="card__body">
        <h4 style="margin-bottom: var(--space-12);">Daily Summary</h4>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Opening Balance:</span>
          <strong>${formatCurrency(openingBalance)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Total Inflows:</span>
          <strong style="color: var(--color-success);">+${formatCurrency(totalIn)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Total Outflows:</span>
          <strong style="color: var(--color-error);">-${formatCurrency(totalOut)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Net Cash Flow:</span>
          <strong style="color: ${netCashFlow >= 0 ? 'var(--color-success)' : 'var(--color-error)'};">${formatCurrency(netCashFlow)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-top: var(--space-12); padding-top: var(--space-12); border-top: 1px solid var(--color-border);">
          <span><strong>Closing Balance:</strong></span>
          <strong style="color: var(--color-primary); font-size: 18px;">${formatCurrency(closingBalance)}</strong>
        </div>
      </div>
    </div>
    
    <button class="btn btn--primary btn--full-width" style="margin-top: 30px; margin-bottom: 80px;" onclick="openAddTransaction('in')">+ Add Transaction</button>
  `;
}

function renderSettings() {
  const connectionStatus = APP_STATE.syncStatus === 'connected' ? 
    { icon: '✓', text: 'Connected to Google Sheets', class: 'success' } :
    { icon: '○', text: 'Not connected yet. Add your URL above.', class: 'warning' };
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: var(--space-16);" class="fade-in">
      <h2>⚙️ Settings</h2>
    </div>
    
    <div class="settings-section slide-up">
      <h3>📊 Google Sheets Sync Setup</h3>
      <div class="card" style="margin-bottom: var(--space-16);">
        <div class="card__body">
          <p style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Connect your Google Sheet to automatically sync all transactions in real-time.</p>
          
          <div class="form-group">
            <label for="webAppUrlInput" class="form-label">Google Apps Script Web App URL</label>
            <input 
              type="url" 
              id="webAppUrlInput" 
              class="form-control" 
              placeholder="https://script.google.com/macros/s/.../exec"
              value="${APP_STATE.webAppUrl || ''}"
            >
          </div>
          
          <div class="d-flex" style="gap: var(--space-12); margin-top: var(--space-16);">
            <button class="btn btn--primary btn--full-width" onclick="saveWebAppUrl()">💾 Save URL</button>
            <button class="btn btn--secondary btn--full-width" onclick="testConnection()">🔍 Test Connection</button>
          </div>
          
          <div class="setting-item" style="margin-top: var(--space-16); border: 1px solid var(--color-border);">
            <div class="setting-label">Connection Status</div>
            <div class="sync-indicator ${connectionStatus.class}">
              <span>${connectionStatus.icon}</span>
              <span>${connectionStatus.text}</span>
            </div>
          </div>
          
          ${APP_STATE.sheetsSync.lastSync ? `
            <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-top: var(--space-8); margin-bottom: 0;">
              Last synced: ${new Date(APP_STATE.sheetsSync.lastSync).toLocaleString()}
            </p>
          ` : ''}
        </div>
      </div>
      
      <div class="card">
        <div class="card__body">
          <h4 style="margin-bottom: var(--space-12);">📖 Setup Instructions</h4>
          <ol style="padding-left: var(--space-20); line-height: 1.8; color: var(--color-text-secondary);">
            <li>Open the <a href="#" onclick="alert('Template link will be provided after setup'); return false;" style="color: var(--color-primary);">CashFlow Template Google Sheet</a></li>
            <li>Make a copy: File → Make a copy</li>
            <li>Open Tools → Script editor</li>
            <li>Copy the provided Google Apps Script code</li>
            <li>Click Deploy → New deployment</li>
            <li>Select "Web app" and set access to "Anyone"</li>
            <li>Copy the Web App URL and paste it above</li>
            <li>Click Save and Test Connection</li>
          </ol>
          <p style="margin-top: var(--space-16); margin-bottom: 0;">
            <a href="#" onclick="alert('Video tutorial coming soon!'); return false;" target="_blank" style="color: var(--color-primary); text-decoration: underline;">📹 Watch video tutorial</a>
          </p>
        </div>
      </div>
    </div>
    
    <div class="settings-section slide-up">
      <h3>Categories</h3>
      ${renderCategorySettings()}
    </div>
    
    <div class="settings-section slide-up">
      <h3>Preferences</h3>
      <div class="setting-item">
        <div class="setting-label">Currency</div>
        <div class="setting-value">R (South African Rand)</div>
      </div>
      <div class="setting-item">
        <div>
          <div class="setting-label">Minimum Cash Alert</div>
          <div class="setting-value">Alert when balance falls below threshold</div>
        </div>
      </div>
      <div style="margin-top: var(--space-12);">
        <label for="thresholdInput" class="form-label">Alert Threshold Amount:</label>
        <div class="d-flex" style="gap: var(--space-12);">
          <input type="number" id="thresholdInput" class="form-control" value="${APP_STATE.minimumThreshold}" min="0" step="50">
          <button class="btn btn--primary" onclick="updateThreshold()">Update</button>
        </div>
      </div>
    </div>
    
    <div class="settings-section slide-up">
      <h3>Help &amp; Support</h3>
      <div class="card">
        <div class="card__body">
          <p style="margin-bottom: var(--space-8);"><strong>Need help?</strong></p>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary); margin-bottom: var(--space-16);">
            CashFlow Partner helps South African informal traders manage their daily cash flow with smart insights and real-time tracking.
          </p>
          <p style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">
            <strong>Privacy:</strong> Your data is synced to your personal Google Sheet. Only you have access to your financial information.
          </p>
        </div>
      </div>
    </div>
    

  `;
}

function renderCategorySettings() {
  const currentMonth = getDateKey(APP_STATE.currentDate).substring(0, 7);
  const monthTransactions = APP_STATE.transactions.filter(t => t.date.startsWith(currentMonth));
  
  const categoryTotals = {};
  APP_STATE.categories.forEach(cat => {
    categoryTotals[cat.name] = 0;
  });
  
  monthTransactions.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.amountOut;
    }
  });
  
  const categoryRows = APP_STATE.categories.map(cat => {
    return `
      <div class="category-row" style="border-left-color: ${cat.color};">
        <span style="font-size: 22px;">${cat.icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${cat.name}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">This month: ${formatCurrency(categoryTotals[cat.name])}</div>
        </div>
        <span class="category-color-dot" style="background: ${cat.color};"></span>
      </div>
    `;
  }).join('');
  
  return `<div class="category-list">${categoryRows}</div>`;
}

function renderCategories() {
  const currentMonth = getDateKey(APP_STATE.currentDate).substring(0, 7);
  const monthTransactions = APP_STATE.transactions.filter(t => t.date.startsWith(currentMonth));
  
  const categoryTotals = {};
  APP_STATE.categories.forEach(cat => {
    categoryTotals[cat.name] = 0;
  });
  
  monthTransactions.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.amountOut;
    }
  });
  
  const categoryRows = APP_STATE.categories.map(cat => {
    return `
      <div class="category-row" style="border-left-color: ${cat.color};">
        <span style="font-size: 22px;">${cat.icon}</span>
        <div style="flex: 1;">
          <div style="font-weight: 500;">${cat.name}</div>
          <div style="font-size: 12px; color: var(--color-text-secondary);">This month: ${formatCurrency(categoryTotals[cat.name])}</div>
        </div>
        <span class="category-color-dot" style="background: ${cat.color};"></span>
      </div>
    `;
  }).join('');
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: var(--space-16); padding-bottom: var(--space-16);">
      <h2>Categories</h2>
      <p style="color: var(--color-text-secondary);">Monthly spending by category</p>
    </div>
    
    <div class="category-list">${categoryRows}</div>
    
    <div class="card mt-16" style="margin-bottom: 50px; padding-bottom: var(--space-16);">
      <div class="card__body">
        <h4 style="margin-bottom: var(--space-12);">Threshold Settings</h4>
        <label for="thresholdInput" class="form-label">Minimum Cash Balance Alert:</label>
        <div class="d-flex" style="gap: var(--space-12);">
          <input type="number" id="thresholdInput" class="form-control" value="${APP_STATE.minimumThreshold}" min="0" step="50">
          <button class="btn btn--primary" onclick="updateThreshold()">Update</button>
        </div>
        <p style="font-size: 12px; color: var(--color-text-secondary); margin-top: var(--space-8); margin-bottom: 0;">You'll be warned when your balance falls below this amount.</p>
      </div>
    </div>
    <div style="height: 80px;"></div>
  `;
}

function renderSummary() {
  const viewType = document.getElementById('summaryViewType')?.value || 'weekly';
  
  if (viewType === 'weekly') {
    return renderWeeklySummary();
  } else {
    return renderMonthlySummary();
  }
}

function renderWeeklySummary() {
  const today = new Date(APP_STATE.currentDate);
  const weekDays = [];
  
  for (let i = 6; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    weekDays.push(getDateKey(day));
  }
  
  const weekData = weekDays.map(dateKey => {
    const opening = getOpeningBalance(dateKey);
    const closing = calculateClosingBalance(dateKey);
    const transactions = getTransactionsForDate(dateKey);
    const inflows = transactions.reduce((sum, t) => sum + t.amountIn, 0);
    const outflows = transactions.reduce((sum, t) => sum + t.amountOut, 0);
    
    return { dateKey, opening, inflows, outflows, closing };
  });
  
  const totalInflows = weekData.reduce((sum, d) => sum + d.inflows, 0);
  const totalOutflows = weekData.reduce((sum, d) => sum + d.outflows, 0);
  
  const tableRows = weekData.map(d => `
    <tr>
      <td>${formatDateShort(d.dateKey)}</td>
      <td style="text-align: right;">${formatCurrency(d.opening)}</td>
      <td style="text-align: right; color: var(--color-success);">${formatCurrency(d.inflows)}</td>
      <td style="text-align: right; color: var(--color-error);">${formatCurrency(d.outflows)}</td>
      <td style="text-align: right; font-weight: 500;">${formatCurrency(d.closing)}</td>
    </tr>
  `).join('');
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: 30px; padding-bottom: var(--space-16);">
      <h2>Weekly &amp; Monthly Summary</h2>
      <select id="summaryViewType" class="form-control" style="max-width: 200px; margin-top: var(--space-12);" onchange="switchView('summary')">
        <option value="weekly" selected>Last 7 Days</option>
        <option value="monthly">This Month</option>
      </select>
    </div>
    
    <h3 style="margin-bottom: var(--space-12); margin-top: 30px;">Last 7 Days</h3>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Date</th>
          <th style="text-align: right;">Opening</th>
          <th style="text-align: right;">Inflows</th>
          <th style="text-align: right;">Outflows</th>
          <th style="text-align: right;">Closing</th>
        </tr>
      </thead>
      <tbody>
        ${tableRows}
        <tr class="summary-total-row">
          <td><strong>Total</strong></td>
          <td></td>
          <td style="text-align: right;"><strong>${formatCurrency(totalInflows)}</strong></td>
          <td style="text-align: right;"><strong>${formatCurrency(totalOutflows)}</strong></td>
          <td></td>
        </tr>
      </tbody>
    </table>
    
    <h4 style="margin-top: 30px; margin-bottom: var(--space-12);">Balance Trend (7 Days)</h4>
    <div class="chart-container">
      <canvas id="weeklyChart"></canvas>
    </div>
    
    <button class="btn btn--secondary btn--full-width" style="margin-bottom: 80px; margin-top: 30px;" onclick="exportData()">📥 Export Data (CSV)</button>
  `;
}

function renderMonthlySummary() {
  const currentMonth = getDateKey(APP_STATE.currentDate).substring(0, 7);
  const monthTransactions = APP_STATE.transactions.filter(t => t.date.startsWith(currentMonth));
  
  const totalInflows = monthTransactions.reduce((sum, t) => sum + t.amountIn, 0);
  const totalOutflows = monthTransactions.reduce((sum, t) => sum + t.amountOut, 0);
  const netCashFlow = totalInflows - totalOutflows;
  
  // Get unique dates in the month
  const uniqueDates = [...new Set(monthTransactions.map(t => t.date))].sort();
  
  const dailyData = uniqueDates.map(dateKey => {
    const opening = getOpeningBalance(dateKey);
    const closing = calculateClosingBalance(dateKey);
    const transactions = getTransactionsForDate(dateKey);
    const inflows = transactions.reduce((sum, t) => sum + t.amountIn, 0);
    const outflows = transactions.reduce((sum, t) => sum + t.amountOut, 0);
    
    return { dateKey, opening, inflows, outflows, closing };
  });
  
  const tableRows = dailyData.map(d => `
    <tr>
      <td>${formatDateShort(d.dateKey)}</td>
      <td style="text-align: right;">${formatCurrency(d.opening)}</td>
      <td style="text-align: right; color: var(--color-success);">${formatCurrency(d.inflows)}</td>
      <td style="text-align: right; color: var(--color-error);">${formatCurrency(d.outflows)}</td>
      <td style="text-align: right; font-weight: 500;">${formatCurrency(d.closing)}</td>
    </tr>
  `).join('');
  
  return `
    <div style="margin-top: var(--space-24); margin-bottom: 30px; padding-bottom: var(--space-16);">
      <h2>Weekly &amp; Monthly Summary</h2>
      <select id="summaryViewType" class="form-control" style="max-width: 200px; margin-top: var(--space-12);" onchange="switchView('summary')">
        <option value="weekly">Last 7 Days</option>
        <option value="monthly" selected>This Month</option>
      </select>
    </div>
    
    <div class="card" style="margin-top: 30px; margin-bottom: 30px;">
      <div class="card__body">
        <h3 style="margin-bottom: var(--space-12);">Monthly Summary</h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Total Inflows:</span>
          <strong style="color: var(--color-success);">+${formatCurrency(totalInflows)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
          <span>Total Outflows:</span>
          <strong style="color: var(--color-error);">-${formatCurrency(totalOutflows)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: var(--space-12); border-top: 1px solid var(--color-border);">
          <span><strong>Net Cash Flow:</strong></span>
          <strong style="color: ${netCashFlow >= 0 ? 'var(--color-success)' : 'var(--color-error)'}; font-size: 18px;">${formatCurrency(netCashFlow)}</strong>
        </div>
      </div>
    </div>
    
    <h4 style="margin-top: 30px; margin-bottom: var(--space-12);">Daily Breakdown</h4>
    <table class="summary-table">
      <thead>
        <tr>
          <th>Date</th>
          <th style="text-align: right;">Opening</th>
          <th style="text-align: right;">Inflows</th>
          <th style="text-align: right;">Outflows</th>
          <th style="text-align: right;">Closing</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>
    
    <h4 style="margin-top: 30px; margin-bottom: var(--space-12);">Monthly Balance Trend</h4>
    <div class="chart-container">
      <canvas id="monthlyChart"></canvas>
    </div>
    
    <button class="btn btn--secondary btn--full-width" style="margin-top: 30px; margin-bottom: 80px;" onclick="exportData()">📥 Export Data (CSV)</button>
  `;
}



// Chart rendering
function renderChart() {
  const viewType = document.getElementById('summaryViewType')?.value || 'weekly';
  
  if (viewType === 'weekly') {
    const canvas = document.getElementById('weeklyChart');
    if (!canvas) return;
    
    const today = new Date(APP_STATE.currentDate);
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);
      const dateKey = getDateKey(day);
      labels.push(formatDateShort(dateKey));
      data.push(calculateClosingBalance(dateKey));
    }
    
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Closing Balance',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return 'R' + value;
              }
            }
          }
        }
      }
    });
  } else {
    const canvas = document.getElementById('monthlyChart');
    if (!canvas) return;
    
    const currentMonth = getDateKey(APP_STATE.currentDate).substring(0, 7);
    const monthTransactions = APP_STATE.transactions.filter(t => t.date.startsWith(currentMonth));
    const uniqueDates = [...new Set(monthTransactions.map(t => t.date))].sort();
    
    const labels = uniqueDates.map(d => formatDateShort(d));
    const data = uniqueDates.map(d => calculateClosingBalance(d));
    
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Closing Balance',
          data: data,
          backgroundColor: '#1FB8CD'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: function(value) {
                return 'R' + value;
              }
            }
          }
        }
      }
    });
  }
}

// Save Web App URL
function saveWebAppUrl() {
  const input = document.getElementById('webAppUrlInput');
  const url = input.value.trim();
  
  if (!url) {
    showToast('⚠️ Please enter a Web App URL');
    return;
  }
  
  if (!url.startsWith('https://script.google.com/')) {
    showToast('⚠️ Please enter a valid Google Apps Script Web App URL');
    return;
  }
  
  APP_STATE.webAppUrl = url;
  APP_STATE.syncStatus = 'connected';
  showToast('✓ Web App URL saved successfully!');
  switchView('settings');
}

// Navigation
function switchView(viewName) {
  
  APP_STATE.currentView = viewName;
  
  const nav = document.querySelector('.main-nav');
  nav.style.display = 'flex';
  
  // Update nav buttons
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.dataset.view === viewName) {
      btn.classList.add('active');
    }
  });
  
  // Render view
  const mainContent = document.getElementById('main-content');
  
  switch(viewName) {
    case 'dashboard':
      mainContent.innerHTML = renderDashboard();
      attachDeleteListeners();
      break;
    case 'insights':
      mainContent.innerHTML = renderInsights();
      attachDeleteListeners();
      break;
    case 'cashbook':
      mainContent.innerHTML = renderCashBook();
      attachDeleteListeners();
      break;
    case 'summary':
      mainContent.innerHTML = renderSummary();
      setTimeout(() => renderChart(), 100);
      break;
    case 'settings':
      mainContent.innerHTML = renderSettings();
      break;
  }
}

// Transaction management
function openAddTransaction(type) {
  const dateKey = getDateKey(APP_STATE.currentDate);
  const categoryOptions = APP_STATE.categories.map(cat => 
    `<option value="${cat.name}">${cat.icon} ${cat.name}</option>`
  ).join('');
  
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-card scale-in">
      <h3>${type === 'in' ? '💵 Record Sale' : '💳 Log Expense'}</h3>
      <form id="transactionForm">
        <div class="form-group">
          <label for="txDescription" class="form-label">Description</label>
          <input type="text" id="txDescription" class="form-control" required placeholder="${type === 'in' ? 'E.g., Morning sales' : 'E.g., Transport fare'}" autofocus>
        </div>
        <div class="form-group">
          <label for="txCategory" class="form-label">Category</label>
          <select id="txCategory" class="form-control" required>
            ${categoryOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="txAmount" class="form-label">Amount (R)</label>
          <input type="number" id="txAmount" class="form-control input-large" required min="0" step="0.01" placeholder="0.00">
        </div>
        <div class="form-group">
          <label for="txTime" class="form-label">Time</label>
          <input type="time" id="txTime" class="form-control" required value="${new Date().toTimeString().substring(0, 5)}">
        </div>
        <div class="d-flex" style="gap: var(--space-12); margin-top: var(--space-16);">
          <button type="button" class="btn btn--secondary btn--full-width" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn--primary btn--full-width">Save &amp; Sync</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.remove('hidden');
  
  document.getElementById('transactionForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const time = document.getElementById('txTime').value;
    const description = document.getElementById('txDescription').value;
    const category = document.getElementById('txCategory').value;
    const amount = parseFloat(document.getElementById('txAmount').value);
    
    const transaction = {
      date: dateKey,
      time: time,
      description: description,
      category: category,
      amountIn: type === 'in' ? amount : 0,
      amountOut: type === 'out' ? amount : 0
    };
    
    APP_STATE.transactions.push(transaction);
    APP_STATE.transactionCount++;
    APP_STATE.transactions.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
    
    // Update opening balance for next day
    const nextDay = new Date(APP_STATE.currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayKey = getDateKey(nextDay);
    APP_STATE.openingBalances[nextDayKey] = calculateClosingBalance(dateKey);
    
    closeModal();
    
    // Show success message
    const newBalance = calculateClosingBalance(dateKey);
    const message = type === 'in' ? 
      `✓ Great! Sale recorded. You now have ${formatCurrency(newBalance)}` :
      `✓ Expense logged. Balance: ${formatCurrency(newBalance)}`;
    showToast(message);
    
    // Sync to Google Sheets
    syncToGoogleSheets(transaction);
    
    switchView(APP_STATE.currentView);
  });
}

// Attach delete button listeners
function attachDeleteListeners() {
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      const dateKey = this.getAttribute('data-date');
      const index = parseInt(this.getAttribute('data-index'));
      deleteTransaction(dateKey, index);
    });
  });
}

function deleteTransaction(dateKey, index) {
  const transactions = getTransactionsForDate(dateKey);
  const transaction = transactions[index];
  
  if (!transaction) {
    console.error('Transaction not found');
    return;
  }
  
  // Find the global index by matching all properties
  const globalIndex = APP_STATE.transactions.findIndex(t => 
    t.date === transaction.date && 
    t.time === transaction.time && 
    t.description === transaction.description &&
    t.amountIn === transaction.amountIn &&
    t.amountOut === transaction.amountOut
  );
  
  if (globalIndex > -1) {
    // Remove transaction
    APP_STATE.transactions.splice(globalIndex, 1);
    APP_STATE.transactionCount = Math.max(0, APP_STATE.transactionCount - 1);
    
    // Recalculate opening balance for next day
    const nextDay = new Date(dateKey);
    nextDay.setDate(nextDay.getDate() + 1);
    const nextDayKey = getDateKey(nextDay);
    const closingBalance = calculateClosingBalance(dateKey);
    if (closingBalance !== undefined) {
      APP_STATE.openingBalances[nextDayKey] = closingBalance;
    }
    
    // Show success feedback
    showToast('✓ Transaction deleted');
    
    // Refresh the current view
    switchView(APP_STATE.currentView);
  } else {
    console.error('Could not find transaction in global array');
    showToast('⚠️ Error deleting transaction');
  }
}

function setOpeningBalance() {
  const dateKey = getDateKey(APP_STATE.currentDate);
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="margin-bottom: var(--space-16);">Set Opening Balance</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-16);">Enter the amount of cash you have on hand to start tracking.</p>
      <form id="openingBalanceForm">
        <div class="form-group">
          <label for="openingAmount" class="form-label">Opening Balance (R)</label>
          <input type="number" id="openingAmount" class="form-control input-large" required min="0" step="0.01" placeholder="0.00" autofocus>
        </div>
        <div class="d-flex" style="gap: var(--space-12); margin-top: var(--space-16);">
          <button type="button" class="btn btn--secondary btn--full-width" onclick="closeModal()">Cancel</button>
          <button type="submit" class="btn btn--primary btn--full-width">Set Balance</button>
        </div>
      </form>
    </div>
  `;
  modal.classList.remove('hidden');
  
  document.getElementById('openingBalanceForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('openingAmount').value);
    APP_STATE.openingBalances[dateKey] = amount;
    closeModal();
    switchView('dashboard');
  });
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  document.getElementById('modal').innerHTML = '';
}

function changeDate(newDate) {
  APP_STATE.currentDate = new Date(newDate);
  
  // Initialize opening balance if not exists
  const dateKey = getDateKey(APP_STATE.currentDate);
  if (!APP_STATE.openingBalances[dateKey]) {
    const prevDay = new Date(APP_STATE.currentDate);
    prevDay.setDate(prevDay.getDate() - 1);
    const prevDayKey = getDateKey(prevDay);
    APP_STATE.openingBalances[dateKey] = calculateClosingBalance(prevDayKey);
  }
  
  switchView('cashbook');
}

function updateThreshold() {
  const value = parseFloat(document.getElementById('thresholdInput').value);
  if (value >= 0) {
    APP_STATE.minimumThreshold = value;
    alert('Threshold updated successfully!');
    switchView('categories');
  }
}

function exportData() {
  let csv = 'Date,Time,Description,Category,Amount In,Amount Out,Balance\n';
  
  const sortedDates = [...new Set(APP_STATE.transactions.map(t => t.date))].sort();
  
  sortedDates.forEach(dateKey => {
    const transactions = getTransactionsForDate(dateKey);
    let balance = getOpeningBalance(dateKey);
    
    transactions.forEach(t => {
      balance += t.amountIn - t.amountOut;
      csv += `${t.date},${t.time},"${t.description}",${t.category},${t.amountIn},${t.amountOut},${balance.toFixed(2)}\n`;
    });
  });
  
  const modal = document.getElementById('modal');
  modal.innerHTML = `
    <div class="modal-card">
      <h3 style="margin-bottom: var(--space-16);">Export Data (CSV Format)</h3>
      <p style="color: var(--color-text-secondary); margin-bottom: var(--space-12);">Copy the text below and save it to a file, or send it to yourself via WhatsApp/Email.</p>
      <div class="export-box">
        <textarea id="csvData" class="form-control" readonly>${csv}</textarea>
      </div>
      <div class="d-flex" style="gap: var(--space-12); margin-top: var(--space-16);">
        <button class="btn btn--secondary btn--full-width" onclick="closeModal()">Close</button>
        <button class="btn btn--primary btn--full-width" onclick="copyCsv()">📋 Copy to Clipboard</button>
      </div>
    </div>
  `;
  modal.classList.remove('hidden');
}

function copyCsv() {
  const textarea = document.getElementById('csvData');
  textarea.select();
  document.execCommand('copy');
  alert('Data copied to clipboard!');
}

// Initialize app
window.addEventListener('DOMContentLoaded', () => {
  // Setup nav listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
  
  // Set today as current date
  APP_STATE.currentDate = new Date();
  
  // Setup modal click outside to close
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
      closeModal();
    }
  });
  
  // Initial render - show welcome screen or dashboard
  render();
});
