import React, { useState } from 'react';

const Navbar = ({ levels, selectedLevel, onLevelSelect }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleLevelSelect = (level) => {
    onLevelSelect(level);
    setIsDropdownOpen(false);
  };

  return (
    <nav style={{ background: 'linear-gradient(to right, #2563eb, #7c3aed)' }} className="shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-white text-lg sm:text-xl font-bold">English Teacher</h1>
          </div>

          {/* Menu de Niveles */}
          <div className="navbar-dropdown">
            <button
              onClick={toggleDropdown}
              className="text-white px-3 sm:px-4 py-2 rounded-lg flex items-center hover:bg-white/20 transition-all duration-300 text-sm sm:text-base"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              aria-expanded={isDropdownOpen}
            >
              <span className="truncate max-w-32 sm:max-w-none">{selectedLevel ? selectedLevel.name : 'Selecciona un nivel'}</span>
              <svg
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="navbar-dropdown-menu">
                {levels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => handleLevelSelect(level)}
                    className="navbar-dropdown-item"
                  >
                    {level.name}
                    {level.activitiesCount > 0 && (
                      <span style={{ color: '#6b7280', marginLeft: '0.5rem' }}>({level.activitiesCount} actividades)</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
