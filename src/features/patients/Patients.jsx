
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

const inputClasses =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 dark:border-slate-600 dark:bg-[#0f1b2d] dark:text-slate-100 dark:placeholder:text-slate-500 sm:text-base'

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
    (doctor) => String(doctor.id) === String(user?.doctorId)
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
        previousPatients.filter((patient) => patient.id !== id)
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
    <div className="min-w-0 space-y-6">

      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-bold text-slate-800 sm:text-3xl dark:text-white">
            {isDoctor ? 'My Patients' : 'Patients'}
          </h1>

          <p className="mt-2 text-sm text-slate-500 sm:text-base dark:text-slate-400">
            {isDoctor
              ? 'View your assigned patients and their information.'
              : 'Manage hospital patients and their information.'}
          </p>
        </div>

        {!isDoctor && (
          <button
            type="button"
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
            className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
          >
            <UserPlus size={20} />
            Add Patient
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-300 sm:p-4 dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">
        <div className="relative w-full sm:max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by patient name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClasses} pl-10 pr-4`}
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors duration-300 dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500 dark:bg-[#1d2b40] dark:text-slate-300">
              <tr>
                <th className="px-3 py-4 sm:px-6">Patient Name</th>
                <th className="px-3 py-4 sm:px-6">Age</th>
                <th className="px-3 py-4 sm:px-6">Gender</th>
                <th className="px-3 py-4 sm:px-6">Phone</th>
                <th className="px-3 py-4 sm:px-6">Blood Group</th>
                <th className="px-3 py-4 sm:px-6">Status</th>
                <th className="px-3 py-4 sm:px-6">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredPatients.map((patient) => (
                <tr
                  key={patient.id}
                  className="transition hover:bg-slate-50 dark:hover:bg-[#1d2b40]"
                >
                  <td className="px-3 py-4 font-medium text-slate-800 sm:px-6 dark:text-slate-100">
                    {patient.name}
                  </td>

                  <td className="px-3 py-4 text-slate-600 sm:px-6 dark:text-slate-300">
                    {patient.age}
                  </td>

                  <td className="px-3 py-4 text-slate-600 sm:px-6 dark:text-slate-300">
                    {patient.gender}
                  </td>

                  <td className="px-3 py-4 text-slate-600 sm:px-6 dark:text-slate-300">
                    {patient.phone}
                  </td>

                  <td className="px-3 py-4 text-slate-600 sm:px-6 dark:text-slate-300">
                    {patient.bloodGroup}
                  </td>

                  <td className="px-3 py-4 sm:px-6">
                    <span
                      className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                        patient.status === 'Active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                      }`}
                    >
                      {patient.status || 'Active'}
                    </span>
                  </td>

                  <td className="px-3 py-4 sm:px-6">
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        type="button"
                        title="View patient"
                        onClick={() => setViewingPatient(patient)}
                        className="cursor-pointer rounded-lg p-2 text-cyan-600 transition hover:bg-cyan-50 dark:text-cyan-400 dark:hover:bg-cyan-500/10"
                      >
                        <Eye size={19} />
                      </button>

                      {!isDoctor && (
                        <>
                          <button
                            type="button"
                            title="Edit patient"
                            onClick={() => handleEdit(patient)}
                            className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                          >
                            <Pencil size={19} />
                          </button>

                          <button
                            type="button"
                            title="Delete patient"
                            onClick={() => handleDelete(patient.id)}
                            className="cursor-pointer rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
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
                    className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
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
      </div>

      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredPatients.length} of {visiblePatients.length} patients
      </p>

      {/* Add / Edit Patient Modal */}
      {showForm && !isDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto max-h-[94dvh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-[#172235]">

            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl dark:text-white">
                {editingPatient ? 'Edit Patient' : 'Add New Patient'}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                aria-label="Close form"
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  required
                  className={inputClasses}
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
                  className={inputClasses}
                />

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClasses}
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
                  className={inputClasses}
                />

                <input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className={inputClasses}
                />

                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={inputClasses}
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
                  className={`${inputClasses} sm:col-span-2`}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>

                <input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  className={`${inputClasses} sm:col-span-2`}
                />
              </div>

              <div className="mt-5 flex flex-col-reverse gap-3 sm:mt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 px-5 py-3 text-slate-600 transition hover:bg-slate-50 sm:w-auto dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className="my-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-4 shadow-xl sm:p-6 dark:border-slate-700 dark:bg-[#172235]">

            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-800 sm:text-xl dark:text-white">
                Patient Details
              </h2>

              <button
                type="button"
                onClick={() => setViewingPatient(null)}
                aria-label="Close patient details"
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
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
                  className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:gap-4 dark:border-slate-700"
                >
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </span>

                  <span className="break-words text-sm text-slate-800 sm:text-right dark:text-slate-100">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end sm:mt-6">
              <button
                type="button"
                onClick={() => setViewingPatient(null)}
                className="w-full cursor-pointer rounded-lg bg-cyan-600 px-5 py-2 text-white transition hover:bg-cyan-700 sm:w-auto"
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
