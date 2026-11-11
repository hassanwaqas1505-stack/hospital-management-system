
import { useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
  Printer,
  CheckCircle,
} from 'lucide-react'

import billsData from '../../data/bills'
import useLocalStorage from '../../hooks/useLocalStorage'
import { useAuth } from '../auth/AuthContext'

function Billing() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'Admin'

  const [bills, setBills] = useLocalStorage(
    'hospital_bills',
    billsData
  )

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBill, setEditingBill] = useState(null)
  const [viewingBill, setViewingBill] = useState(null)

  const [formData, setFormData] = useState({
    patientName: '',
    invoiceNumber: '',
    date: '',
    amount: '',
    status: 'Unpaid',
    description: '',
  })

  // Billing Statistics
  const totalRevenue = bills
    .filter((bill) => bill.status === 'Paid')
    .reduce((total, bill) => total + Number(bill.amount), 0)

  const paidInvoices = bills.filter(
    (bill) => bill.status === 'Paid'
  ).length

  const unpaidInvoices = bills.filter(
    (bill) => bill.status === 'Unpaid'
  ).length

  // Search Invoices
  const filteredBills = bills.filter((bill) =>
    `${bill.patientName} ${bill.invoiceNumber}`
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  // Reset Form
  function resetForm() {
    setFormData({
      patientName: '',
      invoiceNumber: '',
      date: '',
      amount: '',
      status: 'Unpaid',
      description: '',
    })

    setEditingBill(null)
    setShowForm(false)
  }

  // Handle Input Changes
  function handleChange(e) {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Add or Update Invoice
  function handleSubmit(e) {
    e.preventDefault()

    if (editingBill && !isAdmin) return

    if (editingBill) {
      setBills((prev) =>
        prev.map((bill) =>
          bill.id === editingBill.id
            ? {
                ...formData,
                id: editingBill.id,
                amount: Number(formData.amount),
              }
            : bill
        )
      )
    } else {
      const newBill = {
        ...formData,
        id: Date.now(),
        amount: Number(formData.amount),
      }

      setBills((prev) => [...prev, newBill])
    }

    resetForm()
  }

  // Edit Invoice (Admin Only)
  function handleEdit(bill) {
    if (!isAdmin) return

    setEditingBill(bill)

    setFormData({
      ...bill,
      amount: String(bill.amount),
    })

    setShowForm(true)
  }

  // Delete Invoice (Admin Only)
  function handleDelete(id) {
    if (!isAdmin) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this invoice?'
    )

    if (confirmDelete) {
      setBills((prev) =>
        prev.filter((bill) => bill.id !== id)
      )
    }
  }

  // Toggle Payment Status
  function handleToggleStatus(bill) {
    setBills((prev) =>
      prev.map((item) =>
        item.id === bill.id
          ? {
              ...item,
              status: item.status === 'Paid' ? 'Unpaid' : 'Paid',
            }
          : item
      )
    )
  }

  // Print Invoice
  function handlePrint(bill) {
    const printWindow = window.open('', '_blank')

    if (!printWindow) {
      alert('Please allow pop-ups to print the invoice.')
      return
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${bill.invoiceNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
            }
            h1 { color: #0891b2; }
            .details { margin-top: 30px; line-height: 2; }
            .amount { font-size: 22px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Hospital Management System</h1>
          <h2>Invoice</h2>
          <div class="details">
            <p><strong>Invoice Number:</strong> ${bill.invoiceNumber}</p>
            <p><strong>Patient Name:</strong> ${bill.patientName}</p>
            <p><strong>Date:</strong> ${bill.date}</p>
            <p><strong>Description:</strong> ${bill.description}</p>
            <p><strong>Status:</strong> ${bill.status}</p>
            <p class="amount">Amount: Rs. ${Number(bill.amount).toLocaleString()}</p>
          </div>
        </body>
      </html>
    `)

    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Billing
          </h1>
          <p className="mt-1 text-slate-500">
            {isAdmin
              ? 'Manage hospital invoices and payments'
              : 'Create invoices and manage patient payments'}
          </p>
        </div>

        <button
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white hover:bg-cyan-700"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div
        className={`grid grid-cols-1 gap-5 sm:grid-cols-2 ${
          isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
        }`}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            {bills.length}
          </h2>
        </div>

        {isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">Total Revenue</p>
            <h2 className="mt-2 text-2xl font-bold text-green-600">
              Rs. {totalRevenue.toLocaleString()}
            </h2>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Paid Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-green-600">
            {paidInvoices}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Unpaid Invoices</p>
          <h2 className="mt-2 text-2xl font-bold text-red-500">
            {unpaidInvoices}
          </h2>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="relative mb-5 max-w-sm">
          <Search
            className="absolute left-3 top-3 text-slate-400"
            size={19}
          />

          <input
            type="text"
            placeholder="Search patient or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-sm text-slate-600">
                <th className="p-4">Invoice</th>
                <th className="p-4">Patient</th>
                <th className="p-4">Date</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="border-b text-sm">
                  <td className="p-4 font-medium text-slate-800">
                    {bill.invoiceNumber}
                  </td>

                  <td className="p-4">{bill.patientName}</td>

                  <td className="p-4">{bill.date}</td>

                  <td className="p-4 font-medium">
                    Rs. {Number(bill.amount).toLocaleString()}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(bill)}
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        bill.status === 'Paid'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                      title="Update payment status"
                    >
                      {bill.status}
                    </button>
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setViewingBill(bill)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleEdit(bill)}
                            className="text-green-600 hover:text-green-800"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            onClick={() => handleDelete(bill.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handlePrint(bill)}
                        className="text-slate-600 hover:text-slate-900"
                        title="Print"
                      >
                        <Printer size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredBills.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="p-6 text-center text-slate-500"
                  >
                    No invoices found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingBill ? 'Edit Invoice' : 'Create Invoice'}
              </h2>

              <button onClick={resetForm}>
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Patient Name
                </label>
                <input
                  required
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Invoice Number
                  </label>
                  <input
                    required
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-005"
                    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Invoice Date
                  </label>
                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Amount (PKR)
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <input
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter service description"
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Payment Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-cyan-500"
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-slate-300 px-5 py-2.5"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-5 py-2.5 font-medium text-white hover:bg-cyan-700"
                >
                  {editingBill ? 'Update Invoice' : 'Save Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Invoice Modal */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Invoice Details
              </h2>

              <button onClick={() => setViewingBill(null)}>
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <p><strong>Invoice:</strong> {viewingBill.invoiceNumber}</p>
              <p><strong>Patient:</strong> {viewingBill.patientName}</p>
              <p><strong>Date:</strong> {viewingBill.date}</p>
              <p><strong>Description:</strong> {viewingBill.description}</p>
              <p>
                <strong>Amount:</strong> Rs.{' '}
                {Number(viewingBill.amount).toLocaleString()}
              </p>
              <p className="flex items-center gap-2">
                <strong>Status:</strong>
                {viewingBill.status}
                {viewingBill.status === 'Paid' && (
                  <CheckCircle size={17} className="text-green-600" />
                )}
              </p>
            </div>

            <button
              onClick={() => handlePrint(viewingBill)}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 text-white hover:bg-cyan-700"
            >
              <Printer size={18} />
              Print Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Billing
