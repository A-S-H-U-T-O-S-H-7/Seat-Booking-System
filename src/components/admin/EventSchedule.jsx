"use client";
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, doc, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { format, addDays, isBefore, startOfDay } from 'date-fns';
import { toast } from 'react-hot-toast';
import { 
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

export default function EventSchedule() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    date: '',
    shifts: [
      { id: 'morning', name: 'Morning', startTime: '06:00', endTime: '12:00', isActive: true },
      { id: 'evening', name: 'Evening', startTime: '16:00', endTime: '22:00', isActive: true }
    ],
    maxCapacity: 400,
    pricePerSeat: 500,
    isActive: true,
    registrationDeadline: '',
    specialInstructions: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const eventsQuery = query(eventsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(eventsQuery);
      const eventsData = [];
      
      snapshot.forEach(doc => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });

      setEvents(eventsData);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    
    if (!currentEvent.title || !currentEvent.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsUpdating(true);
    try {
      const eventId = isEditing ? currentEvent.id : `event_${Date.now()}`;
      const eventDate = new Date(currentEvent.date);
      
      const eventData = {
        title: currentEvent.title,
        description: currentEvent.description,
        date: eventDate,
        shifts: currentEvent.shifts,
        maxCapacity: parseInt(currentEvent.maxCapacity) || 400,
        pricePerSeat: parseInt(currentEvent.pricePerSeat) || 500,
        isActive: currentEvent.isActive,
        registrationDeadline: currentEvent.registrationDeadline ? new Date(currentEvent.registrationDeadline) : null,
        specialInstructions: currentEvent.specialInstructions,
        createdAt: isEditing ? currentEvent.createdAt : new Date(),
        updatedAt: new Date()
      };

      if (isEditing) {
        await updateDoc(doc(db, 'events', eventId), eventData);
        setEvents(prev => prev.map(event => 
          event.id === eventId ? { id: eventId, ...eventData } : event
        ));
        toast.success('Event updated successfully');
      } else {
        await setDoc(doc(db, 'events', eventId), eventData);
        setEvents(prev => [{ id: eventId, ...eventData }, ...prev]);
        toast.success('Event created successfully');
      }

      resetForm();
      setShowEventModal(false);
    } catch (error) {
      console.error('Error saving event:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} event`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditEvent = (event) => {
    setCurrentEvent({
      ...event,
      date: format(event.date.toDate(), 'yyyy-MM-dd'),
      registrationDeadline: event.registrationDeadline ? format(event.registrationDeadline.toDate(), 'yyyy-MM-dd') : ''
    });
    setIsEditing(true);
    setShowEventModal(true);
  };

  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'events', eventId));
      setEvents(prev => prev.filter(event => event.id !== eventId));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const resetForm = () => {
    setCurrentEvent({
      title: '',
      description: '',
      date: '',
      shifts: [
        { id: 'morning', name: 'Morning', startTime: '06:00', endTime: '12:00', isActive: true },
        { id: 'evening', name: 'Evening', startTime: '16:00', endTime: '22:00', isActive: true }
      ],
      maxCapacity: 400,
      pricePerSeat: 500,
      isActive: true,
      registrationDeadline: '',
      specialInstructions: ''
    });
    setIsEditing(false);
  };

  const handleShiftChange = (shiftId, field, value) => {
    setCurrentEvent(prev => ({
      ...prev,
      shifts: prev.shifts.map(shift => 
        shift.id === shiftId ? { ...shift, [field]: value } : shift
      )
    }));
  };

  const getEventStatus = (event) => {
    const eventDate = event.date.toDate();
    const now = new Date();
    
    if (isBefore(eventDate, startOfDay(now))) {
      return 'completed';
    } else if (!event.isActive) {
      return 'cancelled';
    } else {
      return 'upcoming';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Event Schedule</h1>
          <p className="mt-1 text-gray-600">Manage havan events and schedules</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowEventModal(true);
          }}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Create Event
        </button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => {
          const status = getEventStatus(event);
          
          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{event.title}</h3>
                  <p className="text-sm text-gray-600">{event.description}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                  {status}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarDaysIcon className="w-4 h-4 mr-2" />
                  {format(event.date.toDate(), 'MMM dd, yyyy')}
                </div>
                
                <div className="space-y-1">
                  {event.shifts?.filter(shift => shift.isActive).map(shift => (
                    <div key={shift.id} className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="w-4 h-4 mr-2" />
                      {shift.name}: {shift.startTime} - {shift.endTime}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Capacity: {event.maxCapacity}</span>
                  <span className="font-medium text-purple-600">₹{event.pricePerSeat}/seat</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEditEvent(event)}
                    className="text-purple-600 hover:text-purple-900 p-1"
                    title="Edit Event"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                    title="Delete Event"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  Created {format(event.createdAt?.toDate() || new Date(), 'MMM dd, yyyy')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <CalendarDaysIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600 mb-4">Get started by creating your first havan event.</p>
          <button
            onClick={() => {
              resetForm();
              setShowEventModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Create First Event
          </button>
        </div>
      )}

      {/* Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSaveEvent}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                        {isEditing ? 'Edit Event' : 'Create New Event'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Event Title *
                            </label>
                            <input
                              type="text"
                              value={currentEvent.title}
                              onChange={(e) => setCurrentEvent({...currentEvent, title: e.target.value})}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Description
                            </label>
                            <textarea
                              value={currentEvent.description}
                              onChange={(e) => setCurrentEvent({...currentEvent, description: e.target.value})}
                              rows={3}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Event Date *
                            </label>
                            <input
                              type="date"
                              value={currentEvent.date}
                              onChange={(e) => setCurrentEvent({...currentEvent, date: e.target.value})}
                              min={format(new Date(), 'yyyy-MM-dd')}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Registration Deadline
                            </label>
                            <input
                              type="date"
                              value={currentEvent.registrationDeadline}
                              onChange={(e) => setCurrentEvent({...currentEvent, registrationDeadline: e.target.value})}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>
                        </div>

                        {/* Settings */}
                        <div className="space-y-4">
                          <h4 className="text-md font-medium text-gray-900">Settings</h4>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Maximum Capacity
                            </label>
                            <input
                              type="number"
                              value={currentEvent.maxCapacity}
                              onChange={(e) => setCurrentEvent({...currentEvent, maxCapacity: e.target.value})}
                              min="1"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Price Per Seat (₹)
                            </label>
                            <input
                              type="number"
                              value={currentEvent.pricePerSeat}
                              onChange={(e) => setCurrentEvent({...currentEvent, pricePerSeat: e.target.value})}
                              min="0"
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                            />
                          </div>

                          <div className="flex items-center">
                            <input
                              id="isActive"
                              type="checkbox"
                              checked={currentEvent.isActive}
                              onChange={(e) => setCurrentEvent({...currentEvent, isActive: e.target.checked})}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                              Event is Active
                            </label>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Special Instructions
                            </label>
                            <textarea
                              value={currentEvent.specialInstructions}
                              onChange={(e) => setCurrentEvent({...currentEvent, specialInstructions: e.target.value})}
                              rows={3}
                              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                              placeholder="Any special instructions for participants..."
                            />
                          </div>
                        </div>
                      </div>

                      {/* Shifts */}
                      <div className="mt-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Event Shifts</h4>
                        <div className="space-y-4">
                          {currentEvent.shifts.map((shift, index) => (
                            <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={shift.isActive}
                                    onChange={(e) => handleShiftChange(shift.id, 'isActive', e.target.checked)}
                                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm font-medium text-gray-900">{shift.name} Shift</span>
                                </label>
                              </div>
                              
                              {shift.isActive && (
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      Start Time
                                    </label>
                                    <input
                                      type="time"
                                      value={shift.startTime}
                                      onChange={(e) => handleShiftChange(shift.id, 'startTime', e.target.value)}
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                      End Time
                                    </label>
                                    <input
                                      type="time"
                                      value={shift.endTime}
                                      onChange={(e) => handleShiftChange(shift.id, 'endTime', e.target.value)}
                                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isUpdating ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEventModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
