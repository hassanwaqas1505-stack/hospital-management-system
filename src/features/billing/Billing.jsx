
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

const inputClasses =
  'w-full min-w-0 rounded-lg border border-slate-300 bg-white p-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:border-slate-600 dark:bg-[#0f1b2d] dark:text-slate-100 dark:placeholder:text-slate-500'

const modalClasses =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-[#172235] sm:p-6'

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
    <div className="w-full min-w-0 space-y-5 transition-colors duration-300 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
            Billing
          </h1>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            {isAdmin
              ? 'Manage hospital invoices and payments'
              : 'Create invoices and manage patient payments'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
          className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
        >
          <Plus size={20} />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div
        className={`grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 ${
          isAdmin ? 'xl:grid-cols-4' : 'xl:grid-cols-3'
        }`}
      >
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Total Invoices
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-800 dark:text-white">
            {bills.length}
          </h2>
        </div>

        {isAdmin && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Total Revenue
            </p>

            <h2 className="mt-2 break-words text-xl font-bold text-green-600 dark:text-green-400 sm:text-2xl">
              Rs. {totalRevenue.toLocaleString()}
            </h2>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Paid Invoices
          </p>

          <h2 className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {paidInvoices}
          </h2>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-5">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Unpaid Invoices
          </p>

          <h2 className="mt-2 text-2xl font-bold text-red-500 dark:text-red-400">
            {unpaidInvoices}
          </h2>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-5">
        <div className="relative mb-5 w-full min-w-0 sm:max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={19}
          />

          <input
            type="text"
            placeholder="Search patient or invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClasses} py-2.5 pl-10 pr-4`}
          />
        </div>

        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-sm text-slate-600 dark:border-slate-700 dark:bg-[#1d2b40] dark:text-slate-300">
                <th className="p-3 sm:p-4">Invoice</th>
                <th className="p-3 sm:p-4">Patient</th>
                <th className="p-3 sm:p-4">Date</th>
                <th className="p-3 sm:p-4">Amount</th>
                <th className="p-3 sm:p-4">Status</th>
                <th className="p-3 sm:p-4">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="text-sm transition hover:bg-slate-50 dark:hover:bg-[#1d2b40]"
                >
                  <td className="p-3 font-medium text-slate-800 dark:text-slate-100 sm:p-4">
                    {bill.invoiceNumber}
                  </td>

                  <td className="p-3 text-slate-600 dark:text-slate-300 sm:p-4">
                    {bill.patientName}
                  </td>

                  <td className="p-3 text-slate-600 dark:text-slate-300 sm:p-4">
                    {bill.date}
                  </td>

                  <td className="p-3 font-medium text-slate-700 dark:text-slate-200 sm:p-4">
                    Rs. {Number(bill.amount).toLocaleString()}
                  </td>

                  <td className="p-3 sm:p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(bill)}
                      className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition ${
                        bill.status === 'Paid'
                          ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-500/15 dark:text-green-400 dark:hover:bg-green-500/25'
                          : 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25'
                      }`}
                      title="Update payment status"
                    >
                      {bill.status}
                    </button>
                  </td>

                  <td className="p-3 sm:p-4">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setViewingBill(bill)}
                        className="cursor-pointer text-blue-600 transition hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View"
                      >
                        <Eye size={18} />
                      </button>

                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleEdit(bill)}
                            className="cursor-pointer text-green-600 transition hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(bill.id)}
                            className="cursor-pointer text-red-600 transition hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={() => handlePrint(bill)}
                        className="cursor-pointer text-slate-600 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
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
                    className="p-6 text-center text-slate-500 dark:text-slate-400"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className={`my-auto max-h-[94dvh] w-full max-w-xl overflow-y-auto ${modalClasses}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                {editingBill ? 'Edit Invoice' : 'Create Invoice'}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Patient Name
                </label>

                <input
                  required
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  placeholder="Enter patient name"
                  className={inputClasses}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invoice Number
                  </label>

                  <input
                    required
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="INV-005"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Invoice Date
                  </label>

                  <input
                    required
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClasses}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
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
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>

                <input
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter service description"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Payment Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-lg border border-slate-300 px-5 py-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className={`my-auto w-full max-w-md ${modalClasses}`}>
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                Invoice Details
              </h2>

              <button
                type="button"
                onClick={() => setViewingBill(null)}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4 break-words text-sm text-slate-700 dark:text-slate-300">
              <p>
                <strong className="text-slate-800 dark:text-slate-100">Invoice:</strong>{' '}
                {viewingBill.invoiceNumber}
              </p>

              <p>
                <strong className="text-slate-800 dark:text-slate-100">Patient:</strong>{' '}
                {viewingBill.patientName}
              </p>

              <p>
                <strong className="text-slate-800 dark:text-slate-100">Date:</strong>{' '}
                {viewingBill.date}
              </p>

              <p>
                <strong className="text-slate-800 dark:text-slate-100">Description:</strong>{' '}
                {viewingBill.description}
              </p>

              <p>
                <strong className="text-slate-800 dark:text-slate-100">Amount:</strong>{' '}
                Rs. {Number(viewingBill.amount).toLocaleString()}
              </p>

              <p className="flex flex-wrap items-center gap-2">
                <strong className="text-slate-800 dark:text-slate-100">Status:</strong>
                {viewingBill.status}

                {viewingBill.status === 'Paid' && (
                  <CheckCircle
                    size={17}
                    className="text-green-600 dark:text-green-400"
                  />
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => handlePrint(viewingBill)}
              className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-600 py-3 text-white transition hover:bg-cyan-700"
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
