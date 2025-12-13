// import { useState } from 'react';

// const AccountManagement = () => {
//   const [activeFilter, setActiveFilter] = useState('All');
//   const [selectedAccount, setSelectedAccount] = useState(null);

//   // Hard-coded data
//   const accounts = [
//     {
//       _id: '1',
//       type: 'Upi',
//       branch: { _id: 'b1', name: 'Main Branch', code: 'MB001' },
//       balanceHistory: [
//         { date: '2024-12-01', openingBalance: 50000, closingBalance: 52000 },
//         { date: '2024-12-05', openingBalance: 52000, closingBalance: 54500 },
//         { date: '2024-12-10', openingBalance: 54500, closingBalance: 58200 },
//       ],
//       status: 'Active',
//       createdAt: '2024-01-15',
//     },
//     {
//       _id: '2',
//       type: 'Cash',
//       branch: { _id: 'b1', name: 'Main Branch', code: 'MB001' },
//       balanceHistory: [
//         { date: '2024-12-01', openingBalance: 100000, closingBalance: 98500 },
//         { date: '2024-12-05', openingBalance: 98500, closingBalance: 102000 },
//         { date: '2024-12-10', openingBalance: 102000, closingBalance: 105300 },
//       ],
//       status: 'Active',
//       createdAt: '2024-01-15',
//     },
//     {
//       _id: '3',
//       type: 'Credits',
//       branch: { _id: 'b2', name: 'East Branch', code: 'EB002' },
//       balanceHistory: [
//         { date: '2024-12-01', openingBalance: 75000, closingBalance: 73000 },
//         { date: '2024-12-05', openingBalance: 73000, closingBalance: 71500 },
//         { date: '2024-12-10', openingBalance: 71500, closingBalance: 69800 },
//       ],
//       status: 'Active',
//       createdAt: '2024-02-20',
//     },
//     {
//       _id: '4',
//       type: 'Upi',
//       branch: { _id: 'b2', name: 'East Branch', code: 'EB002' },
//       balanceHistory: [
//         { date: '2024-12-01', openingBalance: 45000, closingBalance: 47000 },
//         { date: '2024-12-05', openingBalance: 47000, closingBalance: 49200 },
//       ],
//       status: 'Active',
//       createdAt: '2024-03-10',
//     },
//     {
//       _id: '5',
//       type: 'Cash',
//       branch: { _id: 'b3', name: 'West Branch', code: 'WB003' },
//       balanceHistory: [
//         { date: '2024-12-01', openingBalance: 80000, closingBalance: 78000 },
//       ],
//       status: 'Inactive',
//       createdAt: '2024-04-05',
//     },
//   ];

//   const getLatestBalance = (balanceHistory) => {
//     if (!balanceHistory || balanceHistory.length === 0) return 0;
//     return balanceHistory[balanceHistory.length - 1].closingBalance;
//   };

//   const getBalanceChange = (balanceHistory) => {
//     if (!balanceHistory || balanceHistory.length < 2) return 0;
//     const latest = balanceHistory[balanceHistory.length - 1].closingBalance;
//     const previous = balanceHistory[balanceHistory.length - 2].closingBalance;
//     return latest - previous;
//   };

//   const calculateTotalByType = (type) => {
//     return accounts
//       .filter(acc => acc.type === type)
//       .reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0);
//   };

//   const filteredAccounts = activeFilter === 'All' 
//     ? accounts 
//     : accounts.filter(acc => acc.type === activeFilter);

//   const getTypeIcon = (type) => {
//     switch(type) {
//       case 'Upi': return 'bi-phone-fill';
//       case 'Cash': return 'bi-cash-stack';
//       case 'Credits': return 'bi-credit-card-fill';
//       default: return 'bi-wallet2';
//     }
//   };

//   const getTypeColor = (type) => {
//     switch(type) {
//       case 'Upi': return '#667eea';
//       case 'Cash': return '#38a169';
//       case 'Credits': return '#ed8936';
//       default: return '#718096';
//     }
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       maximumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-IN', {
//       day: '2-digit',
//       month: 'short',
//       year: 'numeric'
//     });
//   };

//   return (
//     <div style={styles.container}>
//       {/* Header */}
//       <div style={styles.header}>
//         <h1 style={styles.headerTitle}>
//           <i className="bi bi-wallet2" style={{color: '#667eea'}}></i>
//           Account Management
//         </h1>
//         <p style={styles.headerSubtitle}>Manage all your branch accounts and balances</p>
//       </div>

//       {/* Stats Grid */}
//       <div style={styles.statsGrid}>
//         <div style={{...styles.statCard, ...styles.statCardUpi}}>
//           <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
//             <i className="bi bi-phone-fill"></i>
//           </div>
//           <h3 style={styles.statTitle}>UPI ACCOUNTS</h3>
//           <div style={styles.statAmount}>{formatCurrency(calculateTotalByType('Upi'))}</div>
//           <div style={styles.statMeta}>
//             <span className="badge bg-primary">{accounts.filter(a => a.type === 'Upi').length} Accounts</span>
//           </div>
//         </div>

//         <div style={{...styles.statCard, ...styles.statCardCash}}>
//           <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #38a169 0%, #2f855a 100%)'}}>
//             <i className="bi bi-cash-stack"></i>
//           </div>
//           <h3 style={styles.statTitle}>CASH ACCOUNTS</h3>
//           <div style={styles.statAmount}>{formatCurrency(calculateTotalByType('Cash'))}</div>
//           <div style={styles.statMeta}>
//             <span className="badge bg-success">{accounts.filter(a => a.type === 'Cash').length} Accounts</span>
//           </div>
//         </div>

//         <div style={{...styles.statCard, ...styles.statCardCredits}}>
//           <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #ed8936 0%, #dd6b20 100%)'}}>
//             <i className="bi bi-credit-card-fill"></i>
//           </div>
//           <h3 style={styles.statTitle}>CREDIT ACCOUNTS</h3>
//           <div style={styles.statAmount}>{formatCurrency(calculateTotalByType('Credits'))}</div>
//           <div style={styles.statMeta}>
//             <span className="badge bg-warning">{accounts.filter(a => a.type === 'Credits').length} Accounts</span>
//           </div>
//         </div>

//         <div style={styles.statCard}>
//           <div style={{...styles.statIcon, background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)'}}>
//             <i className="bi bi-graph-up-arrow"></i>
//           </div>
//           <h3 style={styles.statTitle}>TOTAL BALANCE</h3>
//           <div style={styles.statAmount}>
//             {formatCurrency(accounts.reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0))}
//           </div>
//           <div style={styles.statMeta}>
//             <span className="badge bg-info">{accounts.length} Total Accounts</span>
//           </div>
//         </div>
//       </div>

//       {/* Accounts Section */}
//       <div style={styles.accountsSection}>
//         <div style={styles.sectionHeader}>
//           <h2 style={styles.sectionTitle}>
//             <i className="bi bi-list-ul" style={{marginRight: '10px'}}></i>
//             All Accounts
//           </h2>
//           <div style={styles.filterTabs}>
//             {['All', 'Upi', 'Cash', 'Credits'].map(filter => (
//               <button
//                 key={filter}
//                 className={`btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline-primary'}`}
//                 onClick={() => setActiveFilter(filter)}
//                 style={styles.filterBtn}
//               >
//                 {filter}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Accounts Grid */}
//         <div style={styles.accountsGrid}>
//           {filteredAccounts.map(account => {
//             const latestBalance = getLatestBalance(account.balanceHistory);
//             const balanceChange = getBalanceChange(account.balanceHistory);
//             const changePercent = account.balanceHistory.length >= 2 
//               ? ((balanceChange / account.balanceHistory[account.balanceHistory.length - 2].closingBalance) * 100).toFixed(2)
//               : 0;

//             return (
//               <div 
//                 key={account._id} 
//                 style={styles.accountCard}
//                 onClick={() => setSelectedAccount(selectedAccount?._id === account._id ? null : account)}
//               >
//                 <div style={styles.accountCardHeader}>
//                   <div style={styles.accountCardLeft}>
//                     <div style={{...styles.accountIcon, borderColor: getTypeColor(account.type)}}>
//                       <i className={getTypeIcon(account.type)} style={{color: getTypeColor(account.type)}}></i>
//                     </div>
//                     <div>
//                       <h3 style={styles.accountType}>{account.type}</h3>
//                       <p style={styles.branchName}>
//                         <i className="bi bi-building" style={{marginRight: '5px'}}></i>
//                         {account.branch.name} ({account.branch.code})
//                       </p>
//                     </div>
//                   </div>
//                   <div style={styles.accountCardRight}>
//                     <span className={`badge bg-${account.status === 'Active' ? 'success' : account.status === 'Inactive' ? 'warning' : 'danger'}`}>
//                       {account.status}
//                     </span>
//                   </div>
//                 </div>

//                 <div style={styles.accountBalance}>
//                   <div style={styles.balanceLabel}>Current Balance</div>
//                   <div style={styles.balanceAmount}>{formatCurrency(latestBalance)}</div>
//                   {balanceChange !== 0 && (
//                     <div style={{...styles.balanceChange, color: balanceChange > 0 ? '#38a169' : '#e53e3e'}}>
//                       <i className={`bi bi-arrow-${balanceChange > 0 ? 'up' : 'down'}-circle-fill`}></i>
//                       {formatCurrency(Math.abs(balanceChange))} ({changePercent}%)
//                     </div>
//                   )}
//                 </div>

//                 {selectedAccount?._id === account._id && (
//                   <div style={styles.historySection}>
//                     <h4 style={styles.historyTitle}>
//                       <i className="bi bi-clock-history" style={{marginRight: '8px'}}></i>
//                       Balance History
//                     </h4>
//                     <div style={styles.historyList}>
//                       {account.balanceHistory.slice().reverse().map((history, idx) => (
//                         <div key={idx} style={styles.historyItem}>
//                           <div style={styles.historyDate}>
//                             <i className="bi bi-calendar-date" style={{marginRight: '6px', color: '#667eea'}}></i>
//                             {formatDate(history.date)}
//                           </div>
//                           <div style={styles.historyBalances}>
//                             <div style={styles.historyBalance}>
//                               <span style={styles.historyLabel}>Opening:</span>
//                               <span style={styles.historyValue}>{formatCurrency(history.openingBalance)}</span>
//                             </div>
//                             <div style={styles.historyBalance}>
//                               <span style={styles.historyLabel}>Closing:</span>
//                               <span style={{...styles.historyValue, fontWeight: '700'}}>
//                                 {formatCurrency(history.closingBalance)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 <div style={styles.accountFooter}>
//                   <span style={styles.accountDate}>
//                     <i className="bi bi-calendar-plus" style={{marginRight: '5px'}}></i>
//                     Created: {formatDate(account.createdAt)}
//                   </span>
//                   <button 
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setSelectedAccount(selectedAccount?._id === account._id ? null : account);
//                     }}
//                   >
//                     {selectedAccount?._id === account._id ? 'Hide History' : 'View History'}
//                     <i className={`bi bi-chevron-${selectedAccount?._id === account._id ? 'up' : 'down'}`} style={{marginLeft: '5px'}}></i>
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// const styles = {
//   container: {
//     minHeight: '100vh',
//     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
//     padding: '30px 20px',
//     fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
//   },
//   header: {
//     background: 'white',
//     padding: '30px',
//     borderRadius: '16px',
//     marginBottom: '30px',
//     boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
//   },
//   headerTitle: {
//     color: '#1a202c',
//     fontSize: '32px',
//     fontWeight: '700',
//     marginBottom: '8px',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '15px',
//   },
//   headerSubtitle: {
//     color: '#718096',
//     fontSize: '16px',
//     margin: 0,
//   },
//   statsGrid: {
//     display: 'grid',
//     gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
//     gap: '20px',
//     marginBottom: '30px',
//   },
//   statCard: {
//     background: 'white',
//     padding: '25px',
//     borderRadius: '16px',
//     boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
//     transition: 'transform 0.3s',
//     cursor: 'pointer',
//   },
//   statIcon: {
//     width: '56px',
//     height: '56px',
//     borderRadius: '14px',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '26px',
//     color: 'white',
//     marginBottom: '15px',
//   },
//   statTitle: {
//     color: '#718096',
//     fontSize: '13px',
//     fontWeight: '600',
//     marginBottom: '8px',
//     letterSpacing: '0.5px',
//   },
//   statAmount: {
//     color: '#1a202c',
//     fontSize: '28px',
//     fontWeight: '700',
//     marginBottom: '12px',
//   },
//   statMeta: {
//     fontSize: '13px',
//   },
//   accountsSection: {
//     background: 'white',
//     padding: '30px',
//     borderRadius: '16px',
//     boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
//   },
//   sectionHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginBottom: '25px',
//     flexWrap: 'wrap',
//     gap: '15px',
//   },
//   sectionTitle: {
//     color: '#1a202c',
//     fontSize: '24px',
//     fontWeight: '700',
//     margin: 0,
//     display: 'flex',
//     alignItems: 'center',
//   },
//   filterTabs: {
//     display: 'flex',
//     gap: '10px',
//     flexWrap: 'wrap',
//   },
//   filterBtn: {
//     fontSize: '14px',
//     fontWeight: '600',
//   },
//   accountsGrid: {
//     display: 'grid',
//     gap: '20px',
//   },
//   accountCard: {
//     border: '2px solid #e2e8f0',
//     borderRadius: '12px',
//     padding: '25px',
//     transition: 'all 0.3s',
//     cursor: 'pointer',
//   },
//   accountCardHeader: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: '20px',
//   },
//   accountCardLeft: {
//     display: 'flex',
//     gap: '15px',
//     alignItems: 'center',
//   },
//   accountIcon: {
//     width: '48px',
//     height: '48px',
//     borderRadius: '12px',
//     border: '3px solid',
//     display: 'flex',
//     alignItems: 'center',
//     justifyContent: 'center',
//     fontSize: '22px',
//   },
//   accountType: {
//     color: '#1a202c',
//     fontSize: '20px',
//     fontWeight: '700',
//     margin: 0,
//   },
//   branchName: {
//     color: '#718096',
//     fontSize: '14px',
//     margin: '4px 0 0 0',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   accountCardRight: {
//     display: 'flex',
//     gap: '10px',
//   },
//   accountBalance: {
//     background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
//     padding: '20px',
//     borderRadius: '10px',
//     marginBottom: '20px',
//   },
//   balanceLabel: {
//     color: '#718096',
//     fontSize: '13px',
//     fontWeight: '600',
//     marginBottom: '8px',
//     textTransform: 'uppercase',
//   },
//   balanceAmount: {
//     color: '#1a202c',
//     fontSize: '32px',
//     fontWeight: '700',
//     marginBottom: '8px',
//   },
//   balanceChange: {
//     fontSize: '14px',
//     fontWeight: '600',
//     display: 'flex',
//     alignItems: 'center',
//     gap: '5px',
//   },
//   historySection: {
//     borderTop: '2px solid #e2e8f0',
//     paddingTop: '20px',
//     marginTop: '20px',
//   },
//   historyTitle: {
//     color: '#1a202c',
//     fontSize: '16px',
//     fontWeight: '700',
//     marginBottom: '15px',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   historyList: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '12px',
//   },
//   historyItem: {
//     background: '#f7fafc',
//     padding: '15px',
//     borderRadius: '8px',
//     border: '1px solid #e2e8f0',
//   },
//   historyDate: {
//     color: '#4a5568',
//     fontSize: '14px',
//     fontWeight: '600',
//     marginBottom: '10px',
//     display: 'flex',
//     alignItems: 'center',
//   },
//   historyBalances: {
//     display: 'grid',
//     gridTemplateColumns: '1fr 1fr',
//     gap: '15px',
//   },
//   historyBalance: {
//     display: 'flex',
//     flexDirection: 'column',
//     gap: '4px',
//   },
//   historyLabel: {
//     color: '#718096',
//     fontSize: '12px',
//     fontWeight: '600',
//   },
//   historyValue: {
//     color: '#1a202c',
//     fontSize: '16px',
//     fontWeight: '600',
//   },
//   accountFooter: {
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     marginTop: '15px',
//   },
//   accountDate: {
//     color: '#718096',
//     fontSize: '13px',
//     display: 'flex',
//     alignItems: 'center',
//   },
// };

// export default AccountManagement;



import { useState } from 'react';
import '../../Styles/Accounts.css';

const AccountManagement = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Hard-coded data
  const accounts = [
    {
      _id: '1',
      type: 'Upi',
      branch: { _id: 'b1', name: 'Main Branch', code: 'MB001' },
      balanceHistory: [
        { date: '2024-12-01', openingBalance: 50000, closingBalance: 52000 },
        { date: '2024-12-05', openingBalance: 52000, closingBalance: 54500 },
        { date: '2024-12-10', openingBalance: 54500, closingBalance: 58200 },
      ],
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      _id: '2',
      type: 'Cash',
      branch: { _id: 'b1', name: 'Main Branch', code: 'MB001' },
      balanceHistory: [
        { date: '2024-12-01', openingBalance: 100000, closingBalance: 98500 },
        { date: '2024-12-05', openingBalance: 98500, closingBalance: 102000 },
        { date: '2024-12-10', openingBalance: 102000, closingBalance: 105300 },
      ],
      status: 'Active',
      createdAt: '2024-01-15',
    },
    {
      _id: '3',
      type: 'Credits',
      branch: { _id: 'b2', name: 'East Branch', code: 'EB002' },
      balanceHistory: [
        { date: '2024-12-01', openingBalance: 75000, closingBalance: 73000 },
        { date: '2024-12-05', openingBalance: 73000, closingBalance: 71500 },
        { date: '2024-12-10', openingBalance: 71500, closingBalance: 69800 },
      ],
      status: 'Active',
      createdAt: '2024-02-20',
    },
    {
      _id: '4',
      type: 'Upi',
      branch: { _id: 'b2', name: 'East Branch', code: 'EB002' },
      balanceHistory: [
        { date: '2024-12-01', openingBalance: 45000, closingBalance: 47000 },
        { date: '2024-12-05', openingBalance: 47000, closingBalance: 49200 },
      ],
      status: 'Active',
      createdAt: '2024-03-10',
    },
    {
      _id: '5',
      type: 'Cash',
      branch: { _id: 'b3', name: 'West Branch', code: 'WB003' },
      balanceHistory: [
        { date: '2024-12-01', openingBalance: 80000, closingBalance: 78000 },
      ],
      status: 'Inactive',
      createdAt: '2024-04-05',
    },
  ];

  const getLatestBalance = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length === 0) return 0;
    return balanceHistory[balanceHistory.length - 1].closingBalance;
  };

  const getBalanceChange = (balanceHistory) => {
    if (!balanceHistory || balanceHistory.length < 2) return 0;
    const latest = balanceHistory[balanceHistory.length - 1].closingBalance;
    const previous = balanceHistory[balanceHistory.length - 2].closingBalance;
    return latest - previous;
  };

  const calculateTotalByType = (type) => {
    return accounts
      .filter(acc => acc.type === type)
      .reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0);
  };

  const filteredAccounts = activeFilter === 'All' 
    ? accounts 
    : accounts.filter(acc => acc.type === activeFilter);

  const getTypeIcon = (type) => {
    switch(type) {
      case 'Upi': return 'bi-phone-fill';
      case 'Cash': return 'bi-cash-stack';
      case 'Credits': return 'bi-credit-card-fill';
      default: return 'bi-wallet2';
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'Upi': return '#667eea';
      case 'Cash': return '#38a169';
      case 'Credits': return '#ed8936';
      default: return '#718096';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="account-container">
      {/* Header */}
      <div className="account-header">
        <h1 className="header-title">
          <i className="bi bi-wallet2"></i>
          Account Management
        </h1>
        <p className="header-subtitle">Manage all your branch accounts and balances</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stat-card-upi">
          <div className="stat-icon stat-icon-upi">
            <i className="bi bi-phone-fill"></i>
          </div>
          <h3 className="stat-title">UPI ACCOUNTS</h3>
          <div className="stat-amount">{formatCurrency(calculateTotalByType('Upi'))}</div>
          <div className="stat-meta">
            <span className="badge bg-primary">{accounts.filter(a => a.type === 'Upi').length} Accounts</span>
          </div>
        </div>

        <div className="stat-card stat-card-cash">
          <div className="stat-icon stat-icon-cash">
            <i className="bi bi-cash-stack"></i>
          </div>
          <h3 className="stat-title">CASH ACCOUNTS</h3>
          <div className="stat-amount">{formatCurrency(calculateTotalByType('Cash'))}</div>
          <div className="stat-meta">
            <span className="badge bg-success">{accounts.filter(a => a.type === 'Cash').length} Accounts</span>
          </div>
        </div>

        <div className="stat-card stat-card-credits">
          <div className="stat-icon stat-icon-credits">
            <i className="bi bi-credit-card-fill"></i>
          </div>
          <h3 className="stat-title">CREDIT ACCOUNTS</h3>
          <div className="stat-amount">{formatCurrency(calculateTotalByType('Credits'))}</div>
          <div className="stat-meta">
            <span className="badge bg-warning">{accounts.filter(a => a.type === 'Credits').length} Accounts</span>
          </div>
        </div>

        <div className="stat-card stat-card-total">
          <div className="stat-icon stat-icon-total">
            <i className="bi bi-graph-up-arrow"></i>
          </div>
          <h3 className="stat-title">TOTAL BALANCE</h3>
          <div className="stat-amount">
            {formatCurrency(accounts.reduce((sum, acc) => sum + getLatestBalance(acc.balanceHistory), 0))}
          </div>
          <div className="stat-meta">
            <span className="badge bg-info">{accounts.length} Total Accounts</span>
          </div>
        </div>
      </div>

      {/* Accounts Section */}
      <div className="accounts-section">
        <div className="section-header">
          <h2 className="section-title">
            <i className="bi bi-list-ul"></i>
            All Accounts
          </h2>
          <div className="filter-tabs">
            {['All', 'Upi', 'Cash', 'Credits'].map(filter => (
              <button
                key={filter}
                className={`btn filter-btn ${activeFilter === filter ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Accounts Grid */}
        <div className="accounts-grid">
          {filteredAccounts.map(account => {
            const latestBalance = getLatestBalance(account.balanceHistory);
            const balanceChange = getBalanceChange(account.balanceHistory);
            const changePercent = account.balanceHistory.length >= 2 
              ? ((balanceChange / account.balanceHistory[account.balanceHistory.length - 2].closingBalance) * 100).toFixed(2)
              : 0;

            return (
              <div 
                key={account._id} 
                className="account-card"
                onClick={() => setSelectedAccount(selectedAccount?._id === account._id ? null : account)}
              >
                <div className="account-card-header">
                  <div className="account-card-left">
                    <div className={`account-icon account-icon-${account.type.toLowerCase()}`}>
                      <i className={getTypeIcon(account.type)}></i>
                    </div>
                    <div>
                      <h3 className="account-type">{account.type}</h3>
                      <p className="branch-name">
                        <i className="bi bi-building"></i>
                        {account.branch.name} ({account.branch.code})
                      </p>
                    </div>
                  </div>
                  <div className="account-card-right">
                    <span className={`badge bg-${account.status === 'Active' ? 'success' : account.status === 'Inactive' ? 'warning' : 'danger'}`}>
                      {account.status}
                    </span>
                  </div>
                </div>

                <div className="account-balance">
                  <div className="balance-label">Current Balance</div>
                  <div className="balance-amount">{formatCurrency(latestBalance)}</div>
                  {balanceChange !== 0 && (
                    <div className={`balance-change ${balanceChange > 0 ? 'positive' : 'negative'}`}>
                      <i className={`bi bi-arrow-${balanceChange > 0 ? 'up' : 'down'}-circle-fill`}></i>
                      {formatCurrency(Math.abs(balanceChange))} ({changePercent}%)
                    </div>
                  )}
                </div>

                {selectedAccount?._id === account._id && (
                  <div className="history-section">
                    <h4 className="history-title">
                      <i className="bi bi-clock-history"></i>
                      Balance History
                    </h4>
                    <div className="history-list">
                      {account.balanceHistory.slice().reverse().map((history, idx) => (
                        <div key={idx} className="history-item">
                          <div className="history-date">
                            <i className="bi bi-calendar-date"></i>
                            {formatDate(history.date)}
                          </div>
                          <div className="history-balances">
                            <div className="history-balance">
                              <span className="history-label">Opening:</span>
                              <span className="history-value">{formatCurrency(history.openingBalance)}</span>
                            </div>
                            <div className="history-balance">
                              <span className="history-label">Closing:</span>
                              <span className="history-value history-value-bold">
                                {formatCurrency(history.closingBalance)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="account-footer">
                  <span className="account-date">
                    <i className="bi bi-calendar-plus"></i>
                    Created: {formatDate(account.createdAt)}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedAccount(selectedAccount?._id === account._id ? null : account);
                    }}
                  >
                    {selectedAccount?._id === account._id ? 'Hide History' : 'View History'}
                    <i className={`bi bi-chevron-${selectedAccount?._id === account._id ? 'up' : 'down'}`}></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;