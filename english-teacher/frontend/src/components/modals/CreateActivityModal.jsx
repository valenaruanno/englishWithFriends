import React, { useState, useEffect } from 'react';
import { teacherAPI, fileAPI } from '../../utils/api';

const CreateActivityModal = ({ isOpen, onClose, levels, onActivityCreated, editingActivity = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    levelId: '',
    type: '',
    resourceFileUrl: '',
    resourceFileName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const activityTypes = [
    'Conversación',
    'Gramática',
    'Vocabulario',
    'Comprensión de lectura',
    'Comprensión auditiva',
    'Escritura',
    'Pronunciación',
    'Preparación de exámenes'
  ];

  // Mapeo de tipos en español a inglés para el backend
  const typeMapping = {
    'Conversación': 'SPEAKING',
    'Gramática': 'GRAMMAR',
    'Vocabulario': 'VOCABULARY',
    'Comprensión de lectura': 'READING',
    'Comprensión auditiva': 'LISTENING',
    'Escritura': 'WRITING',
    'Pronunciación': 'SPEAKING',
    'Preparación de exámenes': 'EXERCISE'
  };

  // Mapeo inverso para mostrar valores en español
  const typeReverseMapping = {
    'SPEAKING': 'Conversación',
    'GRAMMAR': 'Gramática',
    'VOCABULARY': 'Vocabulario',
    'READING': 'Comprensión de lectura',
    'LISTENING': 'Comprensión auditiva',
    'WRITING': 'Escritura',
    'EXERCISE': 'Preparación de exámenes',
    'GAME': 'Juego'
  };

  // Cargar datos si estamos editando
  useEffect(() => {
    if (editingActivity) {
      setFormData({
        title: editingActivity.title || '',
        description: editingActivity.description || '',
        content: editingActivity.content || '',
        levelId: editingActivity.levelId || '',
        type: typeReverseMapping[editingActivity.type] || editingActivity.type || '', // Convertir de inglés a español
        resourceFileUrl: editingActivity.resourceFileUrl || '',
        resourceFileName: editingActivity.resourceFileName || ''
      });
      
      // Si hay archivo existente, mostrar info
      if (editingActivity.resourceFileUrl) {
        setUploadedFileInfo({
          fileName: editingActivity.resourceFileName || 'Archivo existente',
          fileUrl: editingActivity.resourceFileUrl
        });
      }
    } else if (isOpen && !editingActivity) {
      // Resetear formulario solo cuando se abre modal para nueva actividad
      setFormData({
        title: '',
        description: '',
        content: '',
        levelId: '',
        type: '',
        resourceFileUrl: '',
        resourceFileName: ''
      });
      setUploadedFileInfo(null);
      setSelectedFile(null);
    }
    setError('');
  }, [editingActivity, isOpen]);

  // Funciones para manejo de archivos
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    
    if (file) {
      // Validar tipo y tamaño
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf', 'audio/mpeg', 'video/mp4'];
      
      if (!validTypes.includes(file.type)) {
        setError('Tipo de archivo no permitido. Solo se permiten: jpg, jpeg, png, webp, pdf, mp3, mp4');
        setSelectedFile(null);
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) { // 10MB
        setError('El archivo es muy grande. Máximo 10MB permitido.');
        setSelectedFile(null);
        return;
      }
      
      setError('');
    }
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      return null;
    }
    
    setIsUploadingFile(true);
    try {
      const response = await fileAPI.uploadActivityFile(selectedFile);
      
      if (response.success) {
        setUploadedFileInfo({
          fileName: response.originalName,
          fileUrl: response.fileUrl,
          filePath: response.filePath
        });
        return {
          resourceFileUrl: response.fileUrl,
          resourceFileName: response.originalName
        };
      } else {
        setError(response.message);
        return null;
      }
    } catch (err) {
      setError('Error al subir archivo: ' + err.message);
      return null;
    } finally {
      setIsUploadingFile(false);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUploadedFileInfo(null);
    setFormData(prev => ({
      ...prev,
      resourceFileUrl: '',
      resourceFileName: ''
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validaciones básicas
      if (!formData.title.trim()) {
        throw new Error('El título es requerido');
      }
      if (!formData.description.trim()) {
        throw new Error('La descripción es requerida');
      }
      if (!formData.levelId) {
        throw new Error('Debe seleccionar un nivel');
      }
      if (!formData.type) {
        throw new Error('Debe seleccionar un tipo de actividad');
      }

      // Subir archivo si hay uno seleccionado
      let fileInfo = null;
      if (selectedFile) {
        fileInfo = await uploadFile();
        if (!fileInfo) {
          throw new Error('Error al subir archivo');
        }
      }

      const activityData = {
        ...formData,
        title: formData.title.trim(),
        description: formData.description.trim(),
        content: formData.content.trim(),
        type: typeMapping[formData.type] || formData.type, // Convertir de español a inglés
        levelId: parseInt(formData.levelId),
        // Usar info del archivo subido o mantener la existente
        resourceFileUrl: fileInfo ? fileInfo.resourceFileUrl : formData.resourceFileUrl,
        resourceFileName: fileInfo ? fileInfo.resourceFileName : formData.resourceFileName
      };

      let response;
      if (editingActivity) {
        // Actualizar actividad existente
        response = await teacherAPI.updateActivity(editingActivity.id, activityData);
      } else {
        // Crear nueva actividad
        response = await teacherAPI.createActivity(activityData);
      }

      // Llamar callback para actualizar la lista
      if (onActivityCreated) {
        onActivityCreated();
      }

      // Cerrar modal
      onClose();

    } catch (err) {
      console.error('Error al guardar actividad:', err);
      setError(err.message || 'Error al guardar la actividad');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      levelId: '',
      type: '',
      resourceUrl: ''
    });
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {editingActivity ? 'Editar Actividad' : 'Nueva Actividad'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="ml-2 text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Conversación básica en presente simple"
                disabled={loading}
                required
              />
            </div>

            {/* Descripción */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descripción *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción breve de la actividad..."
                disabled={loading}
                required
              />
            </div>

            {/* Grid de 2 columnas para Nivel y Tipo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nivel */}
              <div>
                <label htmlFor="levelId" className="block text-sm font-medium text-gray-700 mb-1">
                  Nivel *
                </label>
                <select
                  id="levelId"
                  name="levelId"
                  value={formData.levelId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar nivel</option>
                  {levels.map(level => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tipo */}
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de actividad *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {activityTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* recurso */}
            <div>
              <label htmlFor="resourceFile" className="block text-sm font-medium text-gray-700 mb-1">
                Recurso *
              </label>
              <input
                type="file"
                id="resourceFile"
                name="resourceFile"
                onChange={handleFileChange}
                accept=".jpg,.jpeg,.png,.webp,.pdf,.mp3,.mp4,.doc,.docx"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>

            {/* Contenido */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Contenido detallado
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Contenido detallado de la actividad, instrucciones, ejercicios, etc."
                disabled={loading}
              />
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </div>
                ) : (
                  editingActivity ? 'Actualizar Actividad' : 'Crear Actividad'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;