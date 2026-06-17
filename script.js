let incomes =
    JSON.parse(localStorage.getItem("incomes")) || [];

let transactions =
    JSON.parse(localStorage.getItem("transactions")) || [];

let totalExpenses = 0;

displayTransactions();

function addTransaction() {

    let description =
        document.getElementById("description").value;

    let amount =
        Number(document.getElementById("amount").value);

    let date =
        document.getElementById("date").value;

    if(description === "" || amount <= 0 || date === "") {

        alert("Please fill all fields");
        return;
    }

    transactions.push({
        description: description,
        date: date,
        amount: amount
    });

    saveTransactions();

    displayTransactions();

    document.getElementById("description").value = "";
    document.getElementById("amount").value = "";
    document.getElementById("date").value = "";
}

function displayTransactions() {

    let list =
        document.getElementById("transactionList");

    list.innerHTML = "";

    let searchText =
        document.getElementById("search")
        .value
        .toLowerCase();

    totalExpenses = 0;

    transactions.forEach((transaction, index) => {

        if(
            !transaction.description
            .toLowerCase()
            .includes(searchText)
        ){
            return;
        }

        totalExpenses += transaction.amount;

        let item =
            document.createElement("li");

        item.innerHTML =
            transaction.date +
            " | " +
            transaction.description +
            " | ₹" +
            transaction.amount +

            ` <button onclick="deleteTransaction(${index})">
                Delete
              </button>`;

        list.appendChild(item);
    });

    let totalIncome = 0;

    incomes.forEach((income)=>{
        totalIncome += income.amount;
    });

    document.getElementById("income").innerText =
        "₹" + totalIncome;

    document.getElementById("expenses").innerText =
        "₹" + totalExpenses;

    document.getElementById("balance").innerText =
        "₹" + (totalIncome - totalExpenses);

    displayIncomeHistory();
}

function displayIncomeHistory(){

    let container =
        document.getElementById("incomeList");

    container.innerHTML = "";

    incomes.forEach((income)=>{

        let card =
            document.createElement("div");

        card.className =
            "income-card";

        card.innerHTML = `
            <h3>${income.source}</h3>

            <div class="income-date">
                ${income.date}
            </div>

            <div class="income-total">
                ₹${income.amount}
            </div>

            <button onclick="editIncome(${income.id})">
                Edit
            </button>
        `;

        container.appendChild(card);
    });
}

function deleteTransaction(index) {

    transactions.splice(index, 1);

    saveTransactions();

    displayTransactions();
}

function saveTransactions() {

    localStorage.setItem(
        "transactions",
        JSON.stringify(transactions)
    );
}

function addIncome(){

    let source =
        document.getElementById("incomeSource").value;

    let date =
        document.getElementById("incomeDate").value;

    let amount =
        Number(
            document.getElementById("incomeAmount").value
        );

    if(
        source === "" ||
        date === "" ||
        amount <= 0
    ){
        alert("Enter income details");
        return;
    }

    incomes.push({
        id: Date.now(),
        source: source,
        date: date,
        amount: amount
    });

    localStorage.setItem(
        "incomes",
        JSON.stringify(incomes)
    );

    displayTransactions();

    document.getElementById("incomeSource").value = "";
    document.getElementById("incomeDate").value = "";
    document.getElementById("incomeAmount").value = "";
}

function editIncome(incomeId){

    let income =
        incomes.find(
            i => i.id === incomeId
        );

    let newSource =
        prompt(
            "Edit income source:",
            income.source
        );

    if(newSource === null) return;

    let newAmount =
        Number(
            prompt(
                "Edit amount:",
                income.amount
            )
        );

    if(newAmount <= 0){
        alert("Invalid amount");
        return;
    }

    income.source = newSource;
    income.amount = newAmount;

    localStorage.setItem(
        "incomes",
        JSON.stringify(incomes)
    );

    displayTransactions();
}

function generateReport(){

    let selectedMonth =
        Number(
            document.getElementById("reportMonth").value
        );

    let selectedYear =
        Number(
            document.getElementById("reportYear").value
        );

    let totalIncome = 0;
    let totalExpense = 0;

    incomes.forEach((income)=>{

        let incomeDate =
            new Date(income.date);

        if(
            incomeDate.getMonth() === selectedMonth &&
            incomeDate.getFullYear() === selectedYear
        ){
            totalIncome += income.amount;
        }

    });

    transactions.forEach((transaction)=>{

        let transactionDate =
            new Date(transaction.date);

        if(
            transactionDate.getMonth() === selectedMonth &&
            transactionDate.getFullYear() === selectedYear
        ){
            totalExpense += transaction.amount;
        }

    });

    let monthName =
        new Date(
            selectedYear,
            selectedMonth
        ).toLocaleString(
            "en-US",
            { month: "long" }
        );

    let report =
        document.getElementById("monthlyReport");

    report.style.display = "block";

    report.innerHTML = `
        <h2>${monthName} ${selectedYear} Report</h2>

        <p>
            <strong>Total Income:</strong>
            ₹${totalIncome}
        </p>

        <p>
            <strong>Total Expenses:</strong>
            ₹${totalExpense}
        </p>

        <p>
            <strong>Balance:</strong>
            ₹${totalIncome - totalExpense}
        </p>

        <p>
            <strong>Total Records:</strong>
            ${
                incomes.filter(income => {
                    let d = new Date(income.date);
                    return d.getMonth() === selectedMonth &&
                           d.getFullYear() === selectedYear;
                }).length
                +
                transactions.filter(transaction => {
                    let d = new Date(transaction.date);
                    return d.getMonth() === selectedMonth &&
                           d.getFullYear() === selectedYear;
                }).length
            }
        </p>
    `;
}

function exportCSV(){

    let csv =
        "Type,Date,Description/Source,Amount\n";

    incomes.forEach((income)=>{

        csv +=
            "Income," +
            income.date + "," +
            income.source + "," +
            income.amount + "\n";

    });

    transactions.forEach((transaction)=>{

        csv +=
            "Expense," +
            transaction.date + "," +
            transaction.description + "," +
            transaction.amount + "\n";

    });

    let blob =
        new Blob(
            [csv],
            { type: "text/csv" }
        );

    let url =
        window.URL.createObjectURL(blob);

    let a =
        document.createElement("a");

    a.href = url;

    a.download =
        "ExpenseTrackerReport.csv";

    a.click();

    window.URL.revokeObjectURL(url);
}