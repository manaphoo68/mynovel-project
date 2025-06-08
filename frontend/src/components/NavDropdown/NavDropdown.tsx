// === src/components/NavDropdown/NavDropdown.tsx ===
import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavDropdown.css';

interface Category {
  id: number;
  name: string;
  path: string;
}

interface NavDropdownProps {
  title: string;
  categories: Category[];
}

const NavDropdown: React.FC<NavDropdownProps> = ({ title, categories }) => {
  return (
    <div className="nav-item">
      <span className="nav-item-title">{title}</span>
      <div className="dropdown-content">
        {categories.map((category) => (
          <NavLink key={category.id} to={category.path} className="dropdown-item">
            {category.name}
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default NavDropdown;