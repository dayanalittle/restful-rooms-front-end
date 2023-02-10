// npm modules
import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'

// page components
import Signup from './pages/Signup/Signup'
import Login from './pages/Login/Login'
import Landing from './pages/Landing/Landing'
import Profiles from './pages/Profiles/Profiles'
import ChangePassword from './pages/ChangePassword/ChangePassword'
import AllListings from './pages/AllListings/AllListings'
import ListingDetails from './pages/ListingsDetail/ListingDetails'
import NewListing from './pages/NewListing/NewListing'
import EditListing from './pages/EditListing/EditListing'

// components
import NavBar from './components/NavBar/NavBar'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute'

// services
import * as authService from './services/authService'
import * as listingService from './services/listingService'

// styles
import './App.css'

const App = () => {
  const [user, setUser] = useState(authService.getUser())
  const [listings, setListings] = useState([])
  const navigate = useNavigate()

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    navigate('/')
  }

  const handleSignupOrLogin = () => {
    setUser(authService.getUser())
  }

  const handleAddListing = async (listingData, photo) => {
    const newListing = await listingService.create(listingData)

    if (photo) {
      newListing.photo = await listingPhotoHelper(photo, newListing._id)
    }
    setListings([...listings, newListing])
    navigate('/listings')
  }

  const listingPhotoHelper = async (photo, id) => {
    const photoData = new FormData()
    photoData.append('photo', photo)
    return await listingService.addPhoto(photoData, id)
  }

  const handleUpdateListing = async (listingData) => {
    const updatedListing = await listingService.update(listingData)
    setListings(listings.map((b) => listingData._id === b._id ? updatedListing : b))
    navigate('/listings')
  }

  const handleDeleteListing = async (id) => {

    const deletedListing = await listingService.deleteListing(id)
    setListings(listings.filter(b => b._id !== deletedListing._id))
    navigate('/listings')
  }

  useEffect(() => {
    const fetchAllListings = async () => {
      const data = await listingService.index()
      setListings(data)
    }
    fetchAllListings()
  }, [user])

  return (
    <>
      <NavBar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route
          path="/signup"
          element={<Signup handleSignupOrLogin={handleSignupOrLogin} />}
        />
        <Route
          path="/login"
          element={<Login handleSignupOrLogin={handleSignupOrLogin} />}
        />
        <Route
          path="/profiles"
          element={
            <ProtectedRoute user={user}>
              <Profiles />
            </ProtectedRoute>
          }
        />
        <Route
          path="/change-password"
          element={
            <ProtectedRoute user={user}>
              <ChangePassword handleSignupOrLogin={handleSignupOrLogin} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings"
          element={
            <ProtectedRoute user={user}>
              <AllListings listings={listings} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/new"
          element={
            <ProtectedRoute user={user}>
              <NewListing handleAddListing={handleAddListing} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id"
          element={
            <ProtectedRoute user={user}>
              <ListingDetails user={user} handleDeleteListing={handleDeleteListing} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/listings/:id/edit"
          element={
            <ProtectedRoute user={user}>
              <EditListing handleUpdateListing={handleUpdateListing} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  )
}

export default App
