import React from 'react';
import { fileAPI } from '../utils/api';

const ActivityCard = ({ activity }) => {
  // Mapeo de tipos del backend al español
  const typeMapping = {
    'SPEAKING': 'Conversación',
    'GRAMMAR': 'Gramática', 
    'VOCABULARY': 'Vocabulario',
    'READING': 'Comprensión de lectura',
    'LISTENING': 'Comprensión auditiva',
    'WRITING': 'Escritura',
    'EXERCISE': 'Ejercicio',
    'GAME': 'Juego'
  };

  const handleDownload = () => {
    if (activity.resourceFileUrl) {
      // Crear un enlace temporal para descargar
      const link = document.createElement('a');
      link.href = `http://localhost:8080${activity.resourceFileUrl}`;
      link.download = activity.resourceFileName || 'archivo';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return null;
    
    const extension = fileName.split('.').pop().toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 18h12V6l-4-4H4v16zm4-16v4h4l-4-4z"/>
          </svg>
        );
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'webp':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'mp3':
      case 'wav':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
        );
      case 'mp4':
      case 'avi':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="activity-card">
      <div className="activity-card-content">
        {/* Header con título y tipo */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
          <h4 className="text-lg sm:text-xl font-semibold text-gray-900">{activity.title}</h4>
          {activity.type && (
            <span className="activity-badge self-start">
              {typeMapping[activity.type] || activity.type}
            </span>
          )}
        </div>

        {/* Descripción */}
        <p className="text-gray-600 mb-4" style={{
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>{activity.description}</p>

        {/* Contenido de la actividad si existe */}
        {activity.content && (
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Contenido:</h5>
            <p className="text-gray-600 text-sm" style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>{activity.content}</p>
          </div>
        )}

        {/* Archivo adjunto si existe */}
        {activity.resourceFileUrl && activity.resourceFileName && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getFileIcon(activity.resourceFileName)}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {activity.resourceFileName}
                  </p>
                  <p className="text-xs text-gray-500">Archivo adjunto</p>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Descargar</span>
              </button>
            </div>
          </div>
        )}

        {/* Footer con fecha */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
          {activity.createdAt && (
            <span style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg className="w-4 h-4" style={{ marginRight: '0.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(activity.createdAt).toLocaleDateString('es-ES')}
            </span>
          )}
          
          {/* Indicador de estado activo */}
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${activity.isActive !== false ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            <span className="text-xs text-gray-500">
              {activity.isActive !== false ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
