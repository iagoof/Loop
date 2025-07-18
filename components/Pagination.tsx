/**
 * @file Componente de Paginação
 * @description Renderiza controles de paginação reutilizáveis, incluindo
 * botões de anterior/próximo e números de página.
 */
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
  totalItems: number;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange, itemsPerPage, totalItems }) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
      <div className="text-sm text-slate-600 dark:text-slate-400">
        Mostrando <span className="font-semibold text-slate-800 dark:text-slate-200">{startItem}</span> a <span className="font-semibold text-slate-800 dark:text-slate-200">{endItem}</span> de <span className="font-semibold text-slate-800 dark:text-slate-200">{totalItems}</span> resultados
      </div>
      <nav className="flex items-center space-x-2" aria-label="Paginação">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          <ChevronLeft size={16} className="mr-1" />
          Anterior
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1.5 text-sm font-semibold rounded-md border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          Próximo
          <ChevronRight size={16} className="ml-1" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
