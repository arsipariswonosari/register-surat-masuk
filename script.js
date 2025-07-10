
const form = document.getElementById("suratForm");
const successMsg = document.getElementById("successMsg");
const tableBody = document.querySelector("#dataTable tbody");
const searchBox = document.getElementById("searchBox");
const toggleDark = document.getElementById("toggleDark");
let allData = [];

toggleDark.addEventListener("change", () => {
  document.body.classList.toggle("dark", toggleDark.checked);
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(form).entries());
  formData.timestamp = new Date().toISOString();

  const response = await fetch("https://script.google.com/macros/s/AKfycbwLLh07ICC_MTKtp7A9WY8664u-6grlPS_uMoZtBI_4YPDgHUhekyadfm3irq8OToLc/exec", {
    method: "POST",
    body: JSON.stringify(formData),
    headers: { "Content-Type": "application/json" },
  });

  if (response.ok) {
    successMsg.style.display = "block";
    setTimeout(() => successMsg.style.display = "none", 2000);
    form.reset();
    loadData(); // refresh table
  } else {
    alert("Gagal menyimpan data!");
  }
});

searchBox.addEventListener("input", () => renderTable(searchBox.value));

function addActionButtons(row, item) {
  const td = document.createElement("td");
  td.innerHTML = `
    <button onclick="printSurat('${item.id}')">🖨</button>
    <button onclick="editSurat('${item.id}')">✏️</button>
    <button onclick="deleteSurat('${item.id}')">🗑</button>
  `;
  row.appendChild(td);
}

function renderTable(filter = "") {
  tableBody.innerHTML = "";
  const filtered = allData.filter(d =>
    d.nomor_surat?.toLowerCase().includes(filter.toLowerCase()) ||
    d.asal_surat?.toLowerCase().includes(filter.toLowerCase()) ||
    d.isi_ringkas?.toLowerCase().includes(filter.toLowerCase())
  );

  filtered.forEach((item, i) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.nomor_surat}</td>
      <td>${item.asal_surat}</td>
      <td>${item.isi_ringkas}</td>`;
    addActionButtons(tr, item);
    tableBody.appendChild(tr);
  });
}

async function loadData() {
  const res = await fetch("https://script.google.com/macros/s/AKfycbwLLh07ICC_MTKtp7A9WY8664u-6grlPS_uMoZtBI_4YPDgHUhekyadfm3irq8OToLc/exec");
  const json = await res.json();
  allData = json.data || [];
  renderTable();
}
loadData();

function printSurat(id) {
  const surat = allData.find(item => item.id === id);
  const printWindow = window.open("", "_blank");
  printWindow.document.write(`<pre>${JSON.stringify(surat, null, 2)}</pre>`);
  printWindow.print();
}

function editSurat(id) {
  const surat = allData.find(item => item.id === id);
  for (let field in surat) {
    if (form.elements[field]) {
      form.elements[field].value = surat[field];
    }
  }
}

function deleteSurat(id) {
  if (!confirm("Yakin ingin menghapus surat ini?")) return;
  fetch("https://script.google.com/macros/s/AKfycbwLLh07ICC_MTKtp7A9WY8664u-6grlPS_uMoZtBI_4YPDgHUhekyadfm3irq8OToLc/exec", {
    method: "DELETE",
    body: JSON.stringify({ id }),
    headers: { "Content-Type": "application/json" },
  }).then(loadData);
}
