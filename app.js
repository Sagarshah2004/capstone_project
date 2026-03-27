const categories = {
  Income: ["Salary", "Bonus", "Allowance", "Petty Cash"],
  Expense: ["Food", "Rent", "Shopping", "Entertainment", "Other"]
};

let chartInstance = null;

class Transaction {
  constructor(id, amount, date, type, subcategory, desc) {
    this.id = id;
    this.amount = amount;
    this.date = date;
    this.type = type;
    this.subcategory = subcategory;
    this.desc = desc;
  }
}

class MoneyManager {
  constructor() {
    this.transactions = JSON.parse(localStorage.getItem("transactions")) || [];
    this.editId = null;
    this.render();
  }

  save() {
    localStorage.setItem("transactions", JSON.stringify(this.transactions));
  }

  add(transaction) {
    this.transactions.push(transaction);
    this.save();
    this.render();
  }

  delete(id) {
    if (confirm("Delete this transaction?")) {
      this.transactions = this.transactions.filter(t => t.id !== id);
      this.save();
      this.render();
    }
  }

  edit(id) {
    const t = this.transactions.find(t => t.id === id);

    document.getElementById("amount").value = t.amount;
    document.getElementById("date").value = t.date;

    document.querySelector(`input[name="type"][value="${t.type}"]`).checked = true;

    updateSubcategories(t.type);

    document.getElementById("subcategory").value = t.subcategory;
    document.getElementById("desc").value = t.desc;

    this.editId = id;
    openForm();
  }

  update(updated) {
    this.transactions = this.transactions.map(t =>
      t.id === this.editId ? updated : t
    );
    this.editId = null;
    this.save();
    this.render();
  }

  render() {
    const list = document.getElementById("list");
    list.innerHTML = "";

    let income = 0, expense = 0;

    this.transactions.forEach(t => {
      const row = `
        <tr>
          <td>${t.date}</td>
          <td>${t.type}</td>
          <td>${t.subcategory}</td>
          <td>${t.desc}</td>
          <td>₹${t.amount}</td>
          <td>
            <button onclick="app.edit(${t.id})">Edit</button>
            <button onclick="app.delete(${t.id})">Delete</button>
          </td>
        </tr>
      `;
      list.innerHTML += row;

      if (t.type === "Income") income += Number(t.amount);
      else expense += Number(t.amount);
    });

    document.getElementById("income").innerText = income;
    document.getElementById("expense").innerText = expense;
    document.getElementById("balance").innerText = income - expense;

    const chartBox = document.getElementById("chartBox");
    if (!chartBox || chartBox.style.display === "none") return;

    const savings = income - expense;

    const data = {
      labels: ["Income", "Expense", "Saving"],
      datasets: [{
        data: [income, expense, savings],
        backgroundColor: ["#28a745", "#dc3545", "#007bff"]
      }]
    };

    if (chartInstance) chartInstance.destroy();

    const ctx = document.getElementById("financeChart");

    if (ctx) {
      chartInstance = new Chart(ctx, {
        type: "pie",
        data: data,
      });
    }
  }
}

const app = new MoneyManager();

function toggleChart() {
  const chartBox = document.getElementById("chartBox");
  const btn = document.querySelector(".summary-btn");

  if (chartBox.style.display === "none") {
    chartBox.style.display = "block";
    btn.innerText = "❌ Hide Summary";
    app.render();
  } else {
    chartBox.style.display = "none";
    btn.innerText = "📊 Show Summary";
  }
}

document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener("change", function () {
    updateSubcategories(this.value);
  });
});

function updateSubcategories(type) {
  const subcategory = document.getElementById("subcategory");

  subcategory.innerHTML = `<option value="">Select Category</option>`;

  categories[type].forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    subcategory.appendChild(option);
  });
}

document.getElementById("transactionForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const amount = document.getElementById("amount").value;
  const date = document.getElementById("date").value;
  const type = document.querySelector('input[name="type"]:checked')?.value;
  const sub = document.getElementById("subcategory").value;
  const desc = document.getElementById("desc").value;

  if (!amount || amount <= 0) return alert("Invalid amount");
  if (!date || new Date(date) > new Date()) return alert("Invalid date");
  if (!type) return alert("Select type");
  if (!sub) return alert("Select category");
  if (desc.length > 100) return alert("Description too long");

  const transaction = new Transaction(Date.now(), amount, date, type, sub, desc);

  if (app.editId) app.update(transaction);
  else app.add(transaction);

  closeForm();
  this.reset();
});

function openForm() {
  document.getElementById("popup").classList.add("active");
}

function closeForm() {
  document.getElementById("popup").classList.remove("active");
}