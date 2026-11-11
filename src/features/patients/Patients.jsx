
import { useState } from 'react'
import {
  Search,
  UserPlus,
  Eye,
  X,
  Trash2,
  Pencil,
} from 'lucide-react'

import useLocalStorage from '../../hooks/useLocalStorage'
import patientsData from '../../data/patients'
import doctorsData from '../../data/doctors'
import appointmentsData from '../../data/appointments'
import { useAuth } from '../auth/AuthContext'

function Patients() {
  const { user } = useAuth()

  const [patients, setPatients] = useLocalStorage(
    'hospital_patients',
    patientsData
  )

  const [doctors] = useLocalStorage(
    'hospital_doctors',
    doctorsData
  )

  const [appointments] = useLocalStorage(
    'hospital_appointments',
    appointmentsData
  )

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPatient, setEditingPatient] = useState(null)
  const [viewingPatient, setViewingPatient] = useState(null)

  const isDoctor = user?.role === 'Doctor'

  const currentDoctor = doctors.find(
    (doctor) =>
      String(doctor.id) === String(user?.doctorId)
  )

  const doctorName = currentDoctor?.name || user?.name

  const myAppointmentPatientNames = appointments
    .filter((appointment) => {
      return (
        (
          appointment.doctorId &&
          String(appointment.doctorId) === String(user?.doctorId)
        ) ||
        (
          appointment.doctorName?.trim().toLowerCase() ===
          doctorName?.trim().toLowerCase()
        )
      )
    })
    .map((appointment) =>
      appointment.patientName?.trim().toLowerCase()
    )
    .filter(Boolean)

  const visiblePatients = isDoctor
    ? patients.filter((patient) => {
        const assignedById =
          patient.doctorId &&
          String(patient.doctorId) === String(user?.doctorId)

        const assignedByAppointment =
          myAppointmentPatientNames.includes(
            patient.name?.trim().toLowerCase()
          )

        return assignedById || assignedByAppointment
      })
    : patients

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    phone: '',
    email: '',
    bloodGroup: 'A+',
    address: '',
    status: 'Active',
  })

  function resetForm() {
    setFormData({
      name: '',
      age: '',
      gender: 'Male',
      phone: '',
      email: '',
      bloodGroup: 'A+',
      address: '',
      status: 'Active',
    })

    setEditingPatient(null)
    setShowForm(false)
  }

  function handleDelete(id) {
    if (isDoctor) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this patient?'
    )

    if (confirmDelete) {
      setPatients((previousPatients) =>
        previousPatients.filter(
          (patient) => patient.id !== id
        )
      )
    }
  }

  function handleEdit(patient) {
    if (isDoctor) return

    setEditingPatient(patient)

    setFormData({
      name: patient.name,
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email || '',
      bloodGroup: patient.bloodGroup,
      address: patient.address || '',
      status: patient.status || 'Active',
    })

    setShowForm(true)
  }

  const filteredPatients = visiblePatients.filter((patient) =>
    patient.name.toLowerCase().includes(search.toLowerCase()) ||
    patient.phone.includes(search)
  )

  function handleChange(e) {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (isDoctor) return

    if (editingPatient) {
      setPatients((previousPatients) =>
        previousPatients.map((patient) =>
          patient.id === editingPatient.id
            ? {
                ...formData,
                id: editingPatient.id,
                age: Number(formData.age),
                doctorId: patient.doctorId,
              }
            : patient
        )
      )
    } else {
      const newPatient = {
        ...formData,
        id: Date.now(),
        age: Number(formData.age),
      }

      setPatients((previousPatients) => [
        ...previousPatients,
        newPatient,
      ])
    }

    resetForm()
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            {isDoctor ? 'My Patients' : 'Patients'}
          </h1>

          <p className="mt-2 text-slate-500">
            {isDoctor
              ? 'View your assigned patients and their information.'
              : 'Manage hospital patients and their information.'}
          </p>
        </div>

        {!isDoctor && (
          <button
            onClick={() => {
              setEditingPatient(null)
              setFormData({
                name: '',
                age: '',
                gender: 'Male',
                phone: '',
                email: '',
                bloodGroup: 'A+',
                address: '',
                status: 'Active',
              })
              setShowForm(true)
            }}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700"
          >
            <UserPlus size={20} />
            Add Patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[750px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Patient Name</th>
              <th className="px-6 py-4">Age</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Blood Group</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredPatients.map((patient) => (
              <tr key={patient.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {patient.name}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {patient.age}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {patient.gender}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {patient.phone}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {patient.bloodGroup}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      patient.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {patient.status || 'Active'}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      title="View patient"
                      onClick={() => setViewingPatient(patient)}
                      className="rounded-lg p-2 text-cyan-600 hover:bg-cyan-50"
                    >
                      <Eye size={19} />
                    </button>

                    {!isDoctor && (
                      <>
                        <button
                          title="Edit patient"
                          onClick={() => handleEdit(patient)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={19} />
                        </button>

                        <button
                          title="Delete patient"
                          onClick={() => handleDelete(patient.id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={19} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredPatients.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  {isDoctor
                    ? 'No patients are assigned to you yet.'
                    : 'No patients found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Showing {filteredPatients.length} of {visiblePatients.length} patients
      </p>

      {/* Add / Edit Patient Modal */}
      {showForm && !isDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </h2>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <input
                  name="age"
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="Age"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                >
                  {[
                    'A+', 'A-', 'B+', 'B-',
                    'AB+', 'AB-', 'O+', 'O-',
                  ].map((group) => (
                    <option key={group}>{group}</option>
                  ))}
                </select>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 sm:col-span-2"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 sm:col-span-2"
                />
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border px-5 py-3 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700"
                >
                  {editingPatient ? 'Update Patient' : 'Save Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Patient Modal */}
      {viewingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Patient Details
              </h2>

              <button
                onClick={() => setViewingPatient(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Patient Name', viewingPatient.name],
                ['Age', viewingPatient.age],
                ['Gender', viewingPatient.gender],
                ['Phone', viewingPatient.phone],
                ['Email', viewingPatient.email || 'Not provided'],
                ['Blood Group', viewingPatient.bloodGroup],
                ['Address', viewingPatient.address || 'Not provided'],
                ['Status', viewingPatient.status || 'Active'],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex justify-between gap-4 border-b border-slate-100 pb-3"
                >
                  <span className="font-medium text-slate-500">
                    {label}
                  </span>

                  <span className="text-right text-slate-800">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setViewingPatient(null)}
                className="rounded-lg bg-cyan-600 px-5 py-2 text-white hover:bg-cyan-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Patients
