
import { useState } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  X,
} from 'lucide-react'

import appointmentsData from '../../data/appointments'
import patientsData from '../../data/patients'
import doctorsData from '../../data/doctors'
import useLocalStorage from '../../hooks/useLocalStorage'
import { useAuth } from '../auth/AuthContext'

const inputClasses =
  'w-full min-w-0 rounded-lg border border-slate-200 bg-white p-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-600 dark:bg-[#0f1b2d] dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

const modalClasses =
  'rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-700 dark:bg-[#172235] sm:p-6'

function Appointments() {
  const { user } = useAuth()

  const [appointments, setAppointments] = useLocalStorage(
    'hospital_appointments',
    appointmentsData
  )

  const [patients] = useLocalStorage(
    'hospital_patients',
    patientsData
  )

  const [doctors] = useLocalStorage(
    'hospital_doctors',
    doctorsData
  )

  const isDoctor = user?.role === 'Doctor'

  const currentDoctor = doctors.find(
    (doctor) => String(doctor.id) === String(user?.doctorId)
  )

  const doctorName = currentDoctor?.name || user?.name

  const visibleAppointments = isDoctor
    ? appointments.filter((appointment) =>
        (
          appointment.doctorId &&
          String(appointment.doctorId) === String(user?.doctorId)
        ) ||
        appointment.doctorName?.trim().toLowerCase() ===
          doctorName?.trim().toLowerCase()
      )
    : appointments

  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingAppointment, setEditingAppointment] = useState(null)
  const [viewingAppointment, setViewingAppointment] = useState(null)

  const [formData, setFormData] = useState({
    patientName: '',
    doctorId: '',
    doctorName: '',
    date: '',
    time: '',
    department: '',
    reason: '',
    status: 'Pending',
  })

  const selectableDoctors = doctors.filter((doctor) => {
    const isCurrentlyAssigned =
      editingAppointment &&
      (
        String(doctor.id) === String(editingAppointment.doctorId) ||
        doctor.name.toLowerCase() ===
          editingAppointment.doctorName?.toLowerCase()
      )

    return doctor.availability === 'Available' || isCurrentlyAssigned
  })

  function resetForm() {
    setFormData({
      patientName: '',
      doctorId: '',
      doctorName: '',
      date: '',
      time: '',
      department: '',
      reason: '',
      status: 'Pending',
    })

    setEditingAppointment(null)
    setShowForm(false)
  }

  function handleChange(e) {
    const { name, value } = e.target

    if (name === 'doctorId') {
      const selectedDoctor = doctors.find(
        (doctor) => String(doctor.id) === String(value)
      )

      setFormData((previousData) => ({
        ...previousData,
        doctorId: value,
        doctorName: selectedDoctor?.name || '',
        department: selectedDoctor?.specialization || '',
      }))

      return
    }

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (isDoctor && !editingAppointment) return

    if (isDoctor) {
      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointment,
                status: formData.status,
              }
            : appointment
        )
      )

      resetForm()
      return
    }

    const selectedDoctor = doctors.find(
      (doctor) => String(doctor.id) === String(formData.doctorId)
    )

    if (!selectedDoctor) {
      alert('Please select a valid doctor.')
      return
    }

    const currentAssignedDoctorId = doctors.find(
      (doctor) =>
        String(doctor.id) === String(editingAppointment?.doctorId) ||
        doctor.name.toLowerCase() ===
          editingAppointment?.doctorName?.toLowerCase()
    )?.id

    const isKeepingCurrentDoctor =
      editingAppointment &&
      String(selectedDoctor.id) === String(currentAssignedDoctorId)

    if (
      selectedDoctor.availability !== 'Available' &&
      !isKeepingCurrentDoctor
    ) {
      alert('This doctor is currently unavailable. Please select another doctor.')
      return
    }

    const appointmentDetails = {
      ...formData,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
    }

    if (editingAppointment) {
      setAppointments((previousAppointments) =>
        previousAppointments.map((appointment) =>
          appointment.id === editingAppointment.id
            ? {
                ...appointmentDetails,
                id: editingAppointment.id,
              }
            : appointment
        )
      )
    } else {
      const newAppointment = {
        ...appointmentDetails,
        id: Date.now(),
      }

      setAppointments((previousAppointments) => [
        ...previousAppointments,
        newAppointment,
      ])
    }

    resetForm()
  }

  function handleEdit(appointment) {
    if (isDoctor) return

    const matchedDoctor = doctors.find(
      (doctor) =>
        String(doctor.id) === String(appointment.doctorId) ||
        doctor.name.toLowerCase() ===
          appointment.doctorName?.toLowerCase()
    )

    setEditingAppointment(appointment)

    setFormData({
      patientName: appointment.patientName,
      doctorId: matchedDoctor ? String(matchedDoctor.id) : '',
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      department: appointment.department,
      reason: appointment.reason || '',
      status: appointment.status,
    })

    setShowForm(true)
  }

  function handleDoctorStatusEdit(appointment) {
    if (!isDoctor) return

    setEditingAppointment(appointment)

    setFormData({
      patientName: appointment.patientName,
      doctorId: appointment.doctorId
        ? String(appointment.doctorId)
        : '',
      doctorName: appointment.doctorName,
      date: appointment.date,
      time: appointment.time,
      department: appointment.department,
      reason: appointment.reason || '',
      status: appointment.status,
    })

    setShowForm(true)
  }

  function handleDelete(id) {
    if (isDoctor) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this appointment?'
    )

    if (confirmDelete) {
      setAppointments((previousAppointments) =>
        previousAppointments.filter(
          (appointment) => appointment.id !== id
        )
      )
    }
  }

  const filteredAppointments = visibleAppointments.filter(
    (appointment) =>
      appointment.patientName?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.doctorName?.toLowerCase().includes(search.toLowerCase()) ||
      appointment.department?.toLowerCase().includes(search.toLowerCase())
  )

  function getStatusClasses(status) {
    if (status === 'Confirmed') {
      return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
    }

    if (status === 'Completed') {
      return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
    }

    if (status === 'Cancelled') {
      return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
    }

    return 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'
  }

  return (
    <div className="w-full min-w-0 transition-colors duration-300">
      {/* Page Header */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white sm:text-3xl">
            {isDoctor ? 'My Appointments' : 'Appointments'}
          </h1>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 sm:text-base">
            {isDoctor
              ? 'View and manage the status of your assigned appointments.'
              : 'Manage hospital appointments and schedules.'}
          </p>
        </div>

        {!isDoctor && (
          <button
            type="button"
            onClick={() => {
              setEditingAppointment(null)
              setFormData({
                patientName: '',
                doctorId: '',
                doctorName: '',
                date: '',
                time: '',
                department: '',
                reason: '',
                status: 'Pending',
              })
              setShowForm(true)
            }}
            className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
          >
            <Plus size={20} />
            Book Appointment
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none sm:p-4">
        <div className="relative w-full min-w-0 sm:max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search patient, doctor or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputClasses} pl-10 pr-4`}
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm transition-colors dark:border-slate-700 dark:bg-[#172235] dark:shadow-none">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500 dark:bg-[#1d2b40] dark:text-slate-400">
            <tr>
              <th className="px-4 py-4 sm:px-6">Patient</th>
              <th className="px-4 py-4 sm:px-6">Doctor</th>
              <th className="px-4 py-4 sm:px-6">Department</th>
              <th className="px-4 py-4 sm:px-6">Date</th>
              <th className="px-4 py-4 sm:px-6">Time</th>
              <th className="px-4 py-4 sm:px-6">Status</th>
              <th className="px-4 py-4 sm:px-6">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {filteredAppointments.map((appointment) => (
              <tr
                key={appointment.id}
                className="transition hover:bg-slate-50 dark:hover:bg-[#1d2b40]"
              >
                <td className="px-4 py-4 font-medium text-slate-800 dark:text-slate-100 sm:px-6">
                  {appointment.patientName}
                </td>

                <td className="px-4 py-4 text-slate-600 dark:text-slate-300 sm:px-6">
                  {appointment.doctorName}
                </td>

                <td className="px-4 py-4 text-slate-600 dark:text-slate-300 sm:px-6">
                  {appointment.department}
                </td>

                <td className="px-4 py-4 text-slate-600 dark:text-slate-300 sm:px-6">
                  {appointment.date}
                </td>

                <td className="px-4 py-4 text-slate-600 dark:text-slate-300 sm:px-6">
                  {appointment.time}
                </td>

                <td className="px-4 py-4 sm:px-6">
                  <span
                    className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(appointment.status)}`}
                  >
                    {appointment.status}
                  </span>
                </td>

                <td className="px-4 py-4 sm:px-6">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <button
                      type="button"
                      title="View appointment"
                      onClick={() => setViewingAppointment(appointment)}
                      className="cursor-pointer rounded-lg p-2 text-cyan-600 transition hover:bg-cyan-50 dark:hover:bg-cyan-500/10"
                    >
                      <Eye size={19} />
                    </button>

                    {isDoctor ? (
                      <button
                        type="button"
                        title="Update appointment status"
                        onClick={() => handleDoctorStatusEdit(appointment)}
                        className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
                      >
                        <Pencil size={19} />
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          title="Edit appointment"
                          onClick={() => handleEdit(appointment)}
                          className="cursor-pointer rounded-lg p-2 text-blue-600 transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
                        >
                          <Pencil size={19} />
                        </button>

                        <button
                          type="button"
                          title="Delete appointment"
                          onClick={() => handleDelete(appointment.id)}
                          className="cursor-pointer rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={19} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {filteredAppointments.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-slate-500 dark:text-slate-400"
                >
                  {isDoctor
                    ? 'You have no appointments assigned yet.'
                    : 'No appointments found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        Showing {filteredAppointments.length} of {visibleAppointments.length} appointments
      </p>

      {/* Add / Edit Appointment Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className={`my-auto max-h-[94dvh] w-full max-w-2xl overflow-y-auto ${modalClasses}`}>
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                {isDoctor
                  ? 'Update Appointment Status'
                  : editingAppointment
                    ? 'Edit Appointment'
                    : 'Book New Appointment'}
              </h2>

              <button
                type="button"
                onClick={resetForm}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <select
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  disabled={isDoctor || Boolean(editingAppointment)}
                  className={inputClasses}
                >
                  <option value="">Select Patient</option>

                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.name}>
                      {patient.name}
                    </option>
                  ))}
                </select>

                <select
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className={inputClasses}
                >
                  <option value="">Select Doctor</option>

                  {selectableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}
                      {doctor.availability !== 'Available'
                        ? ' (Unavailable - Existing Appointment)'
                        : ''}
                    </option>
                  ))}
                </select>

                <input
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Department"
                  required
                  readOnly
                  className={`${inputClasses} bg-slate-50 dark:bg-[#0f1b2d]`}
                />

                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className={inputClasses}
                />

                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  disabled={isDoctor}
                  className={inputClasses}
                />

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClasses}
                >
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>

                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="Appointment Reason"
                  rows="3"
                  disabled={isDoctor}
                  className={`${inputClasses} sm:col-span-2`}
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full cursor-pointer rounded-lg border border-slate-200 px-5 py-3 text-slate-600 transition hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700 sm:w-auto"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full cursor-pointer rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white transition hover:bg-cyan-700 sm:w-auto"
                >
                  {isDoctor
                    ? 'Update Status'
                    : editingAppointment
                      ? 'Update Appointment'
                      : 'Book Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {viewingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-4">
          <div className={`my-auto w-full max-w-lg ${modalClasses}`}>
            <div className="mb-5 flex items-center justify-between gap-3 sm:mb-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white sm:text-xl">
                Appointment Details
              </h2>

              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
                className="shrink-0 cursor-pointer rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Patient', viewingAppointment.patientName],
                ['Doctor', viewingAppointment.doctorName],
                ['Department', viewingAppointment.department],
                ['Date', viewingAppointment.date],
                ['Time', viewingAppointment.time],
                ['Reason', viewingAppointment.reason || 'Not provided'],
                ['Status', viewingAppointment.status],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex flex-col justify-between gap-1 border-b border-slate-100 pb-3 dark:border-slate-700 sm:flex-row sm:gap-4"
                >
                  <span className="font-medium text-slate-500 dark:text-slate-400">
                    {label}
                  </span>

                  <span className="break-words text-left text-slate-800 dark:text-slate-100 sm:text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingAppointment(null)}
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

export default Appointments
