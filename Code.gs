const SPREADSHEET_ID = "11EnQdVmP1L8GZ4q9K1hvBxrJWRsApYlbpD9Rr2pKUqo"; 

// Hardcoded Credentials (Security ke liye code mein rakhe hain)
const USERS = {
  "Usman": "1234",
  "UKlove": "1234"
};

function doGet() {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('UK Watch ')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// Login Check karne ka function
function checkLogin(username, password) {
  if (USERS[username] && USERS[username] === password) {
    return { success: true, user: username };
  }
  return { success: false, message: "Ghalt Password ya Username!" };
}

// Baqi purane functions (getFullData, addExpense) wese hi rahen ge...

function getFullData() {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    SpreadsheetApp.flush(); 
    const allSheets = ss.getSheets();
    
    let allData = [];
    let sheetStats = {};
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    allSheets.forEach((s) => {
      const sName = s.getName();
      const sVals = s.getDataRange().getValues();
      let monthlySalary = 0;
      let monthlyTotal = 0;

      if (sVals.length > 1) {
        monthlySalary = Number(sVals[1][8]) || 0; // Column I

        sVals.slice(1).forEach(row => {
          let amt = parseFloat(row[5]); // Column F
          if (!isNaN(amt) && amt > 0) {
            monthlyTotal += amt;
            
            // Current sheet ka pichla mahina nikalna label ke liye
            let currentMonthIdx = monthNames.findIndex(m => sName.includes(m));
            if (sName === "Current Month") currentMonthIdx = 3; // April
            let prevMonthLabel = currentMonthIdx > 0 ? monthNames[currentMonthIdx-1] : "Previous";

            allData.push({
              dt: (row[1] instanceof Date) ? row[1].toISOString() : new Date(row[1]).toISOString(),
              cat: row[3] || "Others",
              desc: row[4] || "",
              amt: amt,
              by: row[6] || "Unknown",
              sheetName: sName,
              prevMonth: prevMonthLabel
            });
          }
        });
      }

      sheetStats[sName] = {
        salary: monthlySalary,
        total: monthlyTotal,
        debt: monthlyTotal > monthlySalary ? (monthlyTotal - monthlySalary) : 0
      };
    });

    return { allData: allData, monthlyStats: sheetStats };
  } catch(e) {
    return { error: e.toString() };
  }
}

function addExpense(formData) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName("Current Month") || ss.getSheets()[0]; 
  const dateObj = new Date(formData.date);
  const day = Utilities.formatDate(dateObj, "GMT+5", "EEEE");
  sheet.appendRow([new Date(), formData.date, day, formData.category, formData.description, formData.amount, formData.addedBy]);
  return "Success";
}

// Har mahine ki 1st ko khud chalne wala function
function createMonthlySheetTrigger() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const now = new Date();
  const currentMonthName = monthNames[now.getMonth()] + " " + now.getFullYear();
  const prevMonthIdx = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
  const lastMonthName = monthNames[prevMonthIdx] + " " + (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear());

  // 1. Purani "Current Month" tab ko pichle mahine ka naam de do (e.g., March 2026)
  const currentTab = ss.getSheetByName("Current Month");
  if (currentTab) {
    currentTab.setName(lastMonthName);
  }

  // 2. Nayi "Current Month" tab banao aur headers set karo
  const newSheet = ss.insertSheet("Current Month", 0);
  const headers = [["Timestamp", "Date", "Day", "Category", "Description", "Amount", "Added By", "", "Monthly Salary", "Total Expense", "Current Debt"]];
  newSheet.getRange("A1:K1").setValues(headers).setFontWeight("bold").setBackground("#f3f4f6");
  
  // 3. Default Salary set karein (Pichle mahine wali salary utha kar naye mein dal dega)
  const lastMonthSheet = ss.getSheetByName(lastMonthName);
  if (lastMonthSheet) {
    const oldSalary = lastMonthSheet.getRange("I2").getValue();
    newSheet.getRange("I2").setValue(oldSalary || 150000); // Default 1.5L agar kuch na mile
  }

  SpreadsheetApp.flush();
}
