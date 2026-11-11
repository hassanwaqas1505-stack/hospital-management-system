
import { useState } from 'react'
import {
  Search,
  UserPlus,
  Eye,
  X,
  Pencil,
  Trash2,
} from 'lucide-react'

import doctorsData from '../../data/doctors'
import useLocalStorage from '../../hooks/useLocalStorage'
import { useAuth } from '../auth/AuthContext'

function Doctors() {
  const [doctors, setDoctors] = useLocalStorage(
    'hospital_doctors',
    doctorsData
  )

  const {
    user,
    users,
    addDoctorAccount,
    updateDoctorAccount,
    deleteDoctorAccount,
  } = useAuth()

  const isAdmin = user?.role === 'Admin'
  const isReceptionist = user?.role === 'Receptionist'

  const [search, setSearch] = useState('')
  const [specializationFilter, setSpecializationFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState(null)
  const [viewingDoctor, setViewingDoctor] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    phone: '',
    email: '',
    password: '',
    gender: 'Male',
    availability: 'Available',
  })

  const editingAccountExists = editingDoctor
    ? users.some((account) => account.id === `doctor-${editingDoctor.id}`)
    : false

  const passwordRequired = !editingDoctor || !editingAccountExists

  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)),
  ]

  function resetForm() {
    setFormData({
      name: '',
      specialization: '',
      experience: '',
      phone: '',
      email: '',
      password: '',
      gender: 'Male',
      availability: 'Available',
    })

    setEditingDoctor(null)
    setShowForm(false)
    setError('')
  }

  function handleChange(e) {
    setFormData((previousData) => ({
      ...previousData,
      [e.target.name]: e.target.value,
    }))
  }

  function handleSubmit(e) {
    e.preventDefault()

    if (!isAdmin) return

    setError('')

    const password = formData.password

    if (passwordRequired && password.length < 6) {
      setError('Please enter a password with at least 6 characters.')
      return
    }

    if (!passwordRequired && password.length > 0 && password.length < 6) {
      setError('New password must contain at least 6 characters.')
      return
    }

    const { password: ignoredPassword, ...doctorDetails } = formData

    const doctorData = {
      ...doctorDetails,
      name: doctorDetails.name.trim(),
      email: doctorDetails.email.trim().toLowerCase(),
      experience: Number(doctorDetails.experience),
    }

    if (editingDoctor) {
      const updatedDoctor = {
        ...doctorData,
        id: editingDoctor.id,
      }

      const accountResult = editingAccountExists
        ? updateDoctorAccount({ ...updatedDoctor, password })
        : addDoctorAccount({ ...updatedDoctor, password })

      if (!accountResult.success) {
        setError(accountResult.error)
        return
      }

      setDoctors((previousDoctors) =>
        previousDoctors.map((doctor) =>
          doctor.id === editingDoctor.id ? updatedDoctor : doctor
        )
      )
    } else {
      const newDoctor = {
        ...doctorData,
        id: Date.now(),
      }

      const accountResult = addDoctorAccount({
        ...newDoctor,
        password,
      })

      if (!accountResult.success) {
        setError(accountResult.error)
        return
      }

      setDoctors((previousDoctors) => [...previousDoctors, newDoctor])
    }

    resetForm()
  }

  function handleEdit(doctor) {
    if (!isAdmin) return

    setEditingDoctor(doctor)
    setError('')

    setFormData({
      name: doctor.name,
      specialization: doctor.specialization,
      experience: doctor.experience,
      phone: doctor.phone,
      email: doctor.email || '',
      password: '',
      gender: doctor.gender,
      availability: doctor.availability,
    })

    setShowForm(true)
  }

  function handleDelete(id) {
    if (!isAdmin) return

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this doctor and their login account?'
    )

    if (confirmDelete) {
      deleteDoctorAccount(id)

      setDoctors((previousDoctors) =>
        previousDoctors.filter((doctor) => doctor.id !== id)
      )
    }
  }

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(search.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(search.toLowerCase())

    const matchesSpecialization =
      specializationFilter === 'All' ||
      doctor.specialization === specializationFilter

    return matchesSearch && matchesSpecialization
  })

  function openAddForm() {
    if (!isAdmin) return

    setEditingDoctor(null)
    setError('')

    setFormData({
      name: '',
      specialization: '',
      experience: '',
      phone: '',
      email: '',
      password: '',
      gender: 'Male',
      availability: 'Available',
    })

    setShowForm(true)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Doctors
          </h1>
          <p className="mt-2 text-slate-500">
            {isReceptionist
              ? 'View hospital doctors and check their availability.'
              : 'Manage hospital doctors and their information.'}
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openAddForm}
            className="flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-5 py-3 font-medium text-white hover:bg-cyan-700"
          >
            <UserPlus size={20} />
            Add Doctor
          </button>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <div className="relative w-full max-w-md">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search by doctor name or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-3 pl-10 pr-4 outline-none focus:border-cyan-500"
          />
        </div>

        <select
          value={specializationFilter}
          onChange={(e) => setSpecializationFilter(e.target.value)}
          className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none focus:border-cyan-500 sm:max-w-xs"
        >
          <option value="All">All Specializations</option>

          {specializations.map((specialization) => (
            <option key={specialization} value={specialization}>
              {specialization}
            </option>
          ))}
        </select>
      </div>

      {/* Doctors Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[850px] text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="px-6 py-4">Doctor Name</th>
              <th className="px-6 py-4">Specialization</th>
              <th className="px-6 py-4">Experience</th>
              <th className="px-6 py-4">Phone</th>
              <th className="px-6 py-4">Gender</th>
              <th className="px-6 py-4">Availability</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredDoctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {doctor.name}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doctor.specialization}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doctor.experience} Years
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doctor.phone}
                </td>

                <td className="px-6 py-4 text-slate-600">
                  {doctor.gender}
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      doctor.availability === 'Available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {doctor.availability}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      title="View doctor"
                      onClick={() => setViewingDoctor(doctor)}
                      className="rounded-lg p-2 text-cyan-600 hover:bg-cyan-50"
                    >
                      <Eye size={19} />
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          title="Edit doctor"
                          onClick={() => handleEdit(doctor)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                        >
                          <Pencil size={19} />
                        </button>

                        <button
                          title="Delete doctor"
                          onClick={() => handleDelete(doctor.id)}
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

            {filteredDoctors.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No doctors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-slate-500">
        Showing {filteredDoctors.length} of {doctors.length} doctors
      </p>

      {/* Add / Edit Doctor Modal - Admin Only */}
      {isAdmin && showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
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
                  placeholder="Doctor Name"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <input
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="Specialization"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <input
                  name="experience"
                  type="number"
                  min="0"
                  max="70"
                  value={formData.experience}
                  onChange={handleChange}
                  placeholder="Experience (Years)"
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

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
                  required
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500"
                />

                <div>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={
                      passwordRequired
                        ? 'Login Password (Required)'
                        : 'New password (Optional)'
                    }
                    required={passwordRequired}
                    minLength={6}
                    autoComplete="new-password"
                    className="w-full rounded-lg border p-3 outline-none focus:border-cyan-500"
                  />

                  <p className="mt-1 text-xs text-slate-500">
                    {passwordRequired
                      ? 'Required to create the doctor login. Minimum 6 characters.'
                      : 'Leave empty to keep the current password.'}
                  </p>
                </div>

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

                <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleChange}
                  className="rounded-lg border p-3 outline-none focus:border-cyan-500 sm:col-span-2"
                >
                  <option>Available</option>
                  <option>Unavailable</option>
                </select>
              </div>

              {error && (
                <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <p className="mt-4 text-xs text-slate-500">
                A login account will automatically be created for this doctor.
              </p>

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
                  {editingDoctor ? 'Update Doctor' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Doctor Modal - Both Roles */}
      {viewingDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">
                Doctor Details
              </h2>

              <button
                onClick={() => setViewingDoctor(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Doctor Name', viewingDoctor.name],
                ['Specialization', viewingDoctor.specialization],
                ['Experience', `${viewingDoctor.experience} Years`],
                ['Phone', viewingDoctor.phone],
                ['Email', viewingDoctor.email || 'Not provided'],
                ['Gender', viewingDoctor.gender],
                ['Availability', viewingDoctor.availability],
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
                onClick={() => setViewingDoctor(null)}
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

export default Doctors
