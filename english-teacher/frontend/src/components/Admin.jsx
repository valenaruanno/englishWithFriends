import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI, authUtils } from '../utils/api';
import CreateActivityModal from './modals/CreateActivityModal';
import FloatingActionButton from './FloatingActionButton';
import SessionManager from './SessionManager';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherData, setTeacherData] = useState(null);
  const navigate = useNavigate();

  // Estados para modales
  const [showCreateActivityModal, setShowCreateActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  // Estados para formularios (mantener para otros usos si es necesario)
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showLevelForm, setShowLevelForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState(null);

  // Estados para los formularios
  const [activityForm, setActivityForm] = useState({
    name: '',
    description: '',
    content: '',
    levelId: ''
  });

  // Estados para alertas de sesión
  // Hook de autenticación con logout automático
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(0);

  const [levelForm, setLevelForm] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    // Verificar autenticación al cargar
    if (!authUtils.isSessionValid()) {
      navigate('/');
      return;
    }

    // Obtener datos del usuario desde localStorage
    const userData = authUtils.getAuthenticatedUser();
    if (userData) {
      setTeacherData(userData);
    }

    loadInitialData();
  }, [navigate]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [allActivities, allLevels] = await Promise.all([
        teacherAPI.getAllActivities(),
        teacherAPI.getAllLevels()
      ]);
      setActivities(allActivities);
      setLevels(allLevels);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funciones para el modal de actividades
  const handleOpenCreateActivityModal = () => {
    setEditingActivity(null);
    setShowCreateActivityModal(true);
  };

  const handleOpenEditActivityModal = (activity) => {
    setEditingActivity(activity);
    setShowCreateActivityModal(true);
  };

  const handleCloseActivityModal = () => {
    setShowCreateActivityModal(false);
    setEditingActivity(null);
  };

  const handleActivityCreated = async () => {
    // Recargar actividades después de crear/editar
    try {
      const updatedActivities = await teacherAPI.getAllActivities();
      setActivities(updatedActivities);
    } catch (error) {
      console.error('Error reloading activities:', error);
    }
  };

  const handleLogout = () => {
    authUtils.logout();
    navigate('/');
  };

  // Funciones para actividades
  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await teacherAPI.updateActivity(editingActivity.id, activityForm);
      } else {
        await teacherAPI.createActivity(activityForm);
      }

      // Recargar actividades
      const updatedActivities = await teacherAPI.getAllActivities();
      setActivities(updatedActivities);

      // Reset form
      setActivityForm({ name: '', description: '', content: '', levelId: '' });
      setShowActivityForm(false);
      setEditingActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta actividad?')) {
      try {
        await teacherAPI.deleteActivity(activityId);
        const updatedActivities = await teacherAPI.getAllActivities();
        setActivities(updatedActivities);
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const handleEditActivity = (activity) => {
    setEditingActivity(activity);
    setActivityForm({
      name: activity.name,
      description: activity.description,
      content: activity.content,
      levelId: activity.levelId
    });
    setShowActivityForm(true);
  };

  // Funciones para niveles
  const handleLevelSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingLevel) {
        await teacherAPI.updateLevel(editingLevel.id, levelForm);
      } else {
        await teacherAPI.createLevel(levelForm);
      }

      // Recargar niveles
      const updatedLevels = await teacherAPI.getAllLevels();
      setLevels(updatedLevels);

      // Reset form
      setLevelForm({ name: '', description: '' });
      setShowLevelForm(false);
      setEditingLevel(null);
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este nivel?')) {
      try {
        await teacherAPI.deleteLevel(levelId);
        const updatedLevels = await teacherAPI.getAllLevels();
        setLevels(updatedLevels);
      } catch (error) {
        console.error('Error deleting level:', error);
      }
    }
  };

  const handleEditLevel = (level) => {
    setEditingLevel(level);
    setLevelForm({
      name: level.name,
      description: level.description
    });
    setShowLevelForm(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SessionManager>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <button 
                onClick={() => navigate('/')}
                className="text-xl sm:text-2xl font-bold text-gray-900"
              >
                Panel de Administración
              </button>
              {teacherData && (
                <span className="text-sm sm:text-base text-gray-600 sm:ml-4 mt-1 sm:mt-0">
                  Bienvenido, {teacherData.name} {teacherData.lastName}
                </span>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200 text-sm sm:text-base w-full sm:w-auto"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('activities')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition duration-200 whitespace-nowrap ${
                activeTab === 'activities'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Actividades ({activities.length})
            </button>
            <button
              onClick={() => setActiveTab('levels')}
              className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm transition duration-200 whitespace-nowrap ${
                activeTab === 'levels'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Niveles ({levels.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'activities' && (
          <div>
            {/* Activities Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gestión de Actividades</h2>
              <button
                onClick={handleOpenCreateActivityModal}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg transition duration-200 flex items-center justify-center w-full sm:w-auto text-sm sm:text-base shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva Actividad
              </button>
            </div>

            {/* Activities List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {activities.map((activity) => (
                <div key={activity.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">{activity.tittle}</h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleOpenEditActivityModal(activity)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-3">{activity.description}</p>
                  <div className="text-xs sm:text-sm text-gray-500">
                    Nivel: <span className="font-medium">{levels.find(l => l.id === activity.levelId)?.name || 'Sin asignar'}</span>
                  </div>
                </div>
              ))}

              {activities.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">No hay actividades disponibles</p>
                  <p className="text-gray-400 text-sm mt-2">Crea tu primera actividad para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <div>
            {/* Levels Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Gestión de Niveles</h2>
              <button
                onClick={() => {
                  setEditingLevel(null);
                  setLevelForm({ name: '', description: '' });
                  setShowLevelForm(true);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 flex items-center justify-center w-full sm:w-auto text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nuevo Nivel
              </button>
            </div>

            {/* Levels List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {levels.map((level) => (
                <div key={level.id} className="bg-white rounded-lg shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">{level.name}</h3>
                    <div className="flex space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleEditLevel(level)}
                        className="text-blue-600 hover:text-blue-700 p-1"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteLevel(level.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3 text-sm sm:text-base line-clamp-3">{level.description}</p>
                  <div className="text-xs sm:text-sm text-gray-500">
                    <span className="font-medium">{activities.filter(a => a.levelId === level.id).length}</span> actividades
                  </div>
                </div>
              ))}

              {levels.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <p className="text-gray-500 text-lg">No hay niveles disponibles</p>
                  <p className="text-gray-400 text-sm mt-2">Crea tu primer nivel para comenzar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Activity Form Modal */}
      {showActivityForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(false);
                    setEditingActivity(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleActivitySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={activityForm.name}
                  onChange={(e) => setActivityForm({...activityForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
                  value={activityForm.description}
                  onChange={(e) => setActivityForm({...activityForm, description: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contenido</label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base resize-none"
                  value={activityForm.content}
                  onChange={(e) => setActivityForm({...activityForm, content: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nivel</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  value={activityForm.levelId}
                  onChange={(e) => setActivityForm({...activityForm, levelId: e.target.value})}
                >
                  <option value="">Selecciona un nivel</option>
                  {levels.map((level) => (
                    <option key={level.id} value={level.id}>{level.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowActivityForm(false);
                    setEditingActivity(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  {editingActivity ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Level Form Modal */}
      {showLevelForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingLevel ? 'Editar Nivel' : 'Nuevo Nivel'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowLevelForm(false);
                  setEditingLevel(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleLevelSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base"
                  value={levelForm.name}
                  onChange={(e) => setLevelForm({...levelForm, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm sm:text-base resize-none"
                  value={levelForm.description}
                  onChange={(e) => setLevelForm({...levelForm, description: e.target.value})}
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowLevelForm(false);
                    setEditingLevel(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                  {editingLevel ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para crear/editar actividades */}
      <CreateActivityModal
        isOpen={showCreateActivityModal}
        onClose={handleCloseActivityModal}
        levels={levels}
        onActivityCreated={handleActivityCreated}
        editingActivity={editingActivity}
      />

      {/* Botón flotante - solo en la pestaña de actividades */}
      {activeTab === 'activities' && (
        <FloatingActionButton
          onClick={handleOpenCreateActivityModal}
          tooltip="Nueva Actividad"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
        />
      )}
    </div>
    </SessionManager>
  );
};

export default Admin;
