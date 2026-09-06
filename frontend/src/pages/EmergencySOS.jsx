import React, { useContext, useEffect, useState, useRef } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import io from 'socket.io-client'
import { toast } from 'react-toastify'
import { useSelector } from 'react-redux'
import { 
  AlertTriangle, 
  MapPin, 
  Phone, 
  Shield, 
  Clock, 
  Truck, 
  Activity, 
  Check, 
  RotateCcw,
  Compass
} from 'lucide-react'

const darkMapStyles = [
  { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#263c3f" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b9a76" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#38414e" }],
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#212a37" }],
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca5b1" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#746855" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1f2835" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#f3d19c" }],
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#2f3930" }],
  },
  {
    featureType: "transit.station",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#17263c" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#515c6d" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#17263c" }],
  },
];

const EmergencySOS = () => {
  const { backendUrl, token } = useContext(AppContext)
  const theme = useSelector((state) => state.ui.theme)

  // SOS States: 'idle', 'locating', 'triggered', 'responding', 'rescued'
  const [sosStatus, setSosStatus] = useState('idle')

  // GPS Coordinates
  const [gpsCoords, setGpsCoords] = useState({ lat: 12.9716, lng: 77.5946 })
  const [phoneNum, setPhoneNum] = useState('')
  const [patientName, setPatientName] = useState('')
  const [sosRecordId, setSosRecordId] = useState(null)

  // Ambulance Tracker
  const [assignedAmbulance, setAssignedAmbulance] = useState(null)
  const [ambulanceCoords, setAmbulanceCoords] = useState({ lat: 12.9916, lng: 77.6146 }) // Starts slightly offset
  const [eta, setEta] = useState('12 mins')

  // List of nearby facilities
  const nearbyFacilities = [
    { name: "Apollo Emergency Center", dist: "1.4 km", contact: "+91-9988771122" },
    { name: "Fortis Cardiac Critical Care", dist: "2.8 km", contact: "+91-9988771133" },
    { name: "HealthVerse Trauma Clinic", dist: "3.2 km", contact: "+91-9988771144" }
  ]

  // Google Maps State and Refs
  const mapRef = useRef(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [markers, setMarkers] = useState({ patient: null, ambulance: null })

  // Fetch user current position immediately on mount to center the map
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
          setGpsCoords(coords)
          setAmbulanceCoords({
            lat: coords.lat + 0.02,
            lng: coords.lng + 0.02
          })
        },
        (error) => {
          console.warn('Geolocation prompt deferred or failed on mount:', error.message)
        },
        { enableHighAccuracy: true }
      )
    }
  }, [])

  // Dynamically load Google Maps script using the user's API Key
  useEffect(() => {
    if (window.google && window.google.maps) {
      setMapLoaded(true)
      return
    }

    const scriptId = 'google-maps-script'
    let script = document.getElementById(scriptId)
    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCELx9riGH_M4cGfjCi4uC650WVEsmrgV0`
      script.async = true
      script.defer = true
      script.onload = () => {
        setMapLoaded(true)
      }
      script.onerror = () => {
        toast.error('Google Maps API failed to load. Please verify your internet connection or API Key.')
      }
      document.head.appendChild(script)
    } else {
      const handleLoad = () => setMapLoaded(true)
      script.addEventListener('load', handleLoad)
      return () => {
        script.removeEventListener('load', handleLoad)
      }
    }
  }, [])

  // Initialize Map Instance
  useEffect(() => {
    if (mapLoaded && mapRef.current && !mapInstance) {
      const map = new window.google.maps.Map(mapRef.current, {
        center: gpsCoords,
        zoom: 14,
        disableDefaultUI: true,
        styles: theme === 'dark' ? darkMapStyles : []
      })
      setMapInstance(map)
    }
  }, [mapLoaded, mapInstance])

  // Sync dark map styles when theme changes dynamically
  useEffect(() => {
    if (mapInstance) {
      mapInstance.setOptions({
        styles: theme === 'dark' ? darkMapStyles : []
      })
    }
  }, [mapInstance, theme])

  // Manage Patient and Ambulance markers
  useEffect(() => {
    if (!mapInstance) return

    // Update or create patient marker
    if (markers.patient) {
      markers.patient.setPosition(gpsCoords)
    } else {
      const patientMarker = new window.google.maps.Marker({
        position: gpsCoords,
        map: mapInstance,
        title: 'Your Location',
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 9,
          fillColor: '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        }
      })
      setMarkers(prev => ({ ...prev, patient: patientMarker }))
    }

    // Pan map to patient coordinate
    mapInstance.panTo(gpsCoords)
  }, [mapInstance, gpsCoords])

  // Handle ambulance tracking marker and fitting bounds
  useEffect(() => {
    if (!mapInstance) return

    if (sosStatus === 'responding') {
      if (markers.ambulance) {
        markers.ambulance.setPosition(ambulanceCoords)
        markers.ambulance.setMap(mapInstance)
      } else {
        const ambulanceMarker = new window.google.maps.Marker({
          position: ambulanceCoords,
          map: mapInstance,
          title: 'Responding Ambulance',
          icon: {
            url: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png',
            scaledSize: new window.google.maps.Size(32, 32),
            origin: new window.google.maps.Point(0, 0),
            anchor: new window.google.maps.Point(16, 16)
          }
        })
        setMarkers(prev => ({ ...prev, ambulance: ambulanceMarker }))
      }

      // Auto-fit bounds to show both patient and ambulance
      const bounds = new window.google.maps.LatLngBounds()
      bounds.extend(gpsCoords)
      bounds.extend(ambulanceCoords)
      mapInstance.fitBounds(bounds)
    } else {
      if (markers.ambulance) {
        markers.ambulance.setMap(null)
      }
    }
  }, [mapInstance, sosStatus, ambulanceCoords, gpsCoords])

  // WebSocket for live responder dispatch tracking
  useEffect(() => {
    if (token) {
      const socketUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'
      const socket = io(socketUrl)

      // Join sandbox user room
      socket.emit('join_user', 'patient_local')

      socket.on('sos_dispatched', (data) => {
        toast.error(`🚨 Emergency ambulance ${data.ambulanceId} has been dispatched to your location!`)
        setSosStatus('responding')
        setAssignedAmbulance(data.ambulanceId)
        setEta(data.eta || '10 mins')
      })

      return () => {
        socket.disconnect()
      }
    }
  }, [token])

  // Animate responding ambulance moving closer to patient coords in real-time
  useEffect(() => {
    if (sosStatus === 'responding') {
      const interval = setInterval(() => {
        setAmbulanceCoords((prev) => {
          const latDiff = gpsCoords.lat - prev.lat
          const lngDiff = gpsCoords.lng - prev.lng
          
          // Move 10% closer on each step
          const nextLat = prev.lat + (latDiff * 0.15)
          const nextLng = prev.lng + (lngDiff * 0.15)
          
          // If close enough, mark rescued
          if (Math.abs(latDiff) < 0.001 && Math.abs(lngDiff) < 0.001) {
            setSosStatus('rescued')
            setEta('Arrived')
            toast.success('🩺 The ambulance responder has arrived at your location!')
            clearInterval(interval)
            return gpsCoords
          }
          
          // Update ETA estimation
          const currentEtaNum = parseInt(eta)
          if (!isNaN(currentEtaNum) && currentEtaNum > 1) {
            setEta(`${currentEtaNum - 1} mins`)
          }

          return { lat: nextLat, lng: nextLng }
        })
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [sosStatus, gpsCoords, eta])

  // Trigger SOS alert
  const handleTriggerSOS = () => {
    setSosStatus('locating')
    
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      setSosStatus('idle')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setGpsCoords(coords)
        
        // Offset ambulance start coordinates relative to patient position
        setAmbulanceCoords({
          lat: coords.lat + 0.02,
          lng: coords.lng + 0.02
        })

        // Prompt phone contact
        setSosStatus('triggered')
      },
      (error) => {
        toast.warn('Could not fetch exact GPS. Defaulting coordinates to center.')
        setSosStatus('triggered')
      },
      { enableHighAccuracy: true }
    )
  }

  // Submit SOS record to backend
  const handleConfirmSOS = async (e) => {
    e.preventDefault()
    if (!phoneNum.trim()) return toast.warning('Please enter your contact phone number')

    try {
      const { data } = await axios.post(`${backendUrl}/api/emergency/sos`, {
        userId: "patient_local",
        patientName: patientName || "Guest Patient",
        phone: phoneNum,
        latitude: gpsCoords.lat,
        longitude: gpsCoords.lng,
        address: "Novacare central coordinates zone"
      })

      if (data.success) {
        setSosRecordId(data.sosId)
        toast.error('🔥 SOS beacon transmitted. Admin and ambulance dispatch notified!')
      }
    } catch (err) {
      toast.error('SOS request failed')
    }
  }

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto py-4">
      
      {/* Title */}
      <div className="border-b pb-4 border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-red-650 flex items-center gap-2">
          <AlertTriangle className="w-7 h-7 text-red-500 animate-pulse" /> Emergency Response Room (SOS)
        </h1>
        <p className="text-zinc-505 dark:text-zinc-400 text-xs">Press the emergency trigger to broadcast location coordinates to medical dispatchers.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs">
        
        {/* LEFT COLUMN: ACTIVE SOS BUTTON CONTROLLER */}
        <div className="lg:col-span-1 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-6 min-h-[360px]">
          
          <div className="space-y-4">
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-1.5">
              <Compass className="w-4.5 h-4.5 text-red-500" /> Emergency Beacon
            </h3>
            
            <p className="text-zinc-500 leading-relaxed text-[11px]">
              Transmitting an SOS instantly logs your latitude/longitude coordinates on the hospital triage board and assigns the nearest active ambulance responder.
            </p>
          </div>

          {/* SOS Pulsing Button container */}
          <div className="flex flex-col items-center justify-center py-6">
            {sosStatus === 'idle' && (
              <button 
                onClick={handleTriggerSOS}
                className="w-28 h-28 rounded-full bg-red-500 hover:bg-red-600 flex flex-col items-center justify-center text-white font-extrabold text-sm shadow-xl shadow-red-500/25 border-4 border-red-200 hover:scale-105 active:scale-95 transition-all cursor-pointer animate-pulse"
              >
                <AlertTriangle className="w-6 h-6 mb-1" />
                TRIGGER SOS
              </button>
            )}

            {sosStatus === 'locating' && (
              <div className="w-28 h-28 rounded-full border-4 border-dashed border-red-500 flex flex-col items-center justify-center animate-spin">
                <Compass className="w-6 h-6 text-red-500" />
              </div>
            )}

            {sosStatus === 'triggered' && (
              <form onSubmit={handleConfirmSOS} className="w-full space-y-3">
                <input
                  id="sos-contact-phone"
                  name="contactPhone"
                  autoComplete="tel"
                  type="tel"
                  placeholder="Enter Contact Phone No. *"
                  required
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                />
                <input
                  id="sos-patient-name"
                  name="patientName"
                  autoComplete="name"
                  type="text"
                  placeholder="Enter Patient Name (Optional)"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full p-2 border border-zinc-200 rounded-xl bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="w-full py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Confirm & Broadcast SOS
                </button>
              </form>
            )}

            {(sosStatus === 'responding' || sosStatus === 'rescued') && (
              <div className="text-center space-y-2">
                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto animate-bounce">
                  <Truck className="w-10 h-10" />
                </div>
                <h4 className="font-extrabold text-sm text-zinc-900 mt-2">Ambulance Responding</h4>
                <p className="text-zinc-500 text-[11px]">ETA: <span className="font-bold text-red-500">{eta}</span></p>
                <button 
                  onClick={() => setSosStatus('idle')}
                  className="px-3 py-1 border border-zinc-200 rounded-lg text-[10px] text-zinc-500 hover:bg-zinc-50 cursor-pointer flex items-center gap-0.5 mx-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Cancel SOS
                </button>
              </div>
            )}
          </div>

          <div className="border-t pt-4">
            <span className="font-bold text-zinc-400 uppercase text-[9px] tracking-wider">Triage Location GPS</span>
            <p className="text-zinc-700 mt-1 leading-none font-mono">
              Lat: {gpsCoords.lat.toFixed(4)} | Lng: {gpsCoords.lng.toFixed(4)}
            </p>
          </div>
        </div>

        {/* RIGHT TWO COLUMNS: TRACKING MAP & QUICK DIALS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* MAP VISUAL CONTAINER */}
          <div className="relative w-full h-80 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm bg-zinc-50 dark:bg-zinc-950">
            {/* Google Map element */}
            <div ref={mapRef} className="w-full h-full" />

            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 bg-opacity-90 z-20">
                <div className="text-center space-y-2">
                  <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-zinc-505 dark:text-zinc-400 text-[10px]">Loading Live GPS Navigation...</p>
                </div>
              </div>
            )}

            <div className="absolute bottom-3 left-3 z-10 text-[9px] text-zinc-650 dark:text-zinc-350 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md px-2 py-1.5 rounded-xl border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm max-w-[190px]">
              🚨 Responding vehicles navigate dynamically.
            </div>
          </div>

          {/* Dial Directory Facilities */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Nearby facilities */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3">
              <h4 className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Nearby Trauma Centers</h4>
              
              <div className="space-y-2">
                {nearbyFacilities.map((facility, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1.5 border-b last:border-0 border-zinc-100">
                    <div>
                      <p className="font-bold text-zinc-805">{facility.name}</p>
                      <p className="text-[10px] text-zinc-400">{facility.dist} away</p>
                    </div>
                    <a href={`tel:${facility.contact}`} className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all cursor-pointer">
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick response dials */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-3 flex flex-col justify-between">
              <h4 className="font-bold text-zinc-450 uppercase text-[9px] tracking-wider">Critical Desk Dials</h4>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="tel:102" className="p-3 border rounded-xl hover:bg-red-50/50 flex flex-col items-center gap-1 cursor-pointer">
                  <Phone className="w-4 h-4 text-red-500" />
                  <span className="font-bold">Ambulance</span>
                  <span className="text-[9px] text-zinc-400">Dial 102</span>
                </a>
                <a href="tel:100" className="p-3 border rounded-xl hover:bg-zinc-50 flex flex-col items-center gap-1 cursor-pointer">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="font-bold">Police</span>
                  <span className="text-[9px] text-zinc-400">Dial 100</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  )
}

export default EmergencySOS
