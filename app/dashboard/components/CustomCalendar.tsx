'use client';

import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  X 
} from 'lucide-react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval 
} from 'date-fns';
import { es } from 'date-fns/locale';

interface CustomCalendarProps {
  selectedDate: Date;
  onSelect: (date: Date) => void;
  onClose: () => void;
}

export default function CustomCalendar({ selectedDate, onSelect, onClose }: CustomCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-800">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[11px] font-black text-white uppercase tracking-widest italic">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-all"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
    return (
      <div className="grid grid-cols-7 mb-1 border-b border-slate-800/50">
        {days.map((day, i) => (
          <div key={i} className="py-2 text-center text-[9px] font-black text-indigo-500 uppercase tracking-tighter">
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;

    const allDays = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="grid grid-cols-7 gap-0.5 p-1.5">
        {allDays.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentMonth = isSameMonth(date, monthStart);
          
          return (
            <button
              key={i}
              type="button"
              onClick={() => {
                onSelect(date);
                onClose();
              }}
              className={`
                h-8 w-full rounded-lg flex items-center justify-center text-[10px] font-bold transition-all
                ${!isCurrentMonth ? 'text-slate-800' : 'text-slate-400'}
                ${isSelected ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'hover:bg-slate-800 text-slate-400'}
              `}
            >
              {format(date, 'd')}
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Calendar Card */}
      <div className="relative w-full max-w-[280px] bg-slate-900 border border-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
        <div className="p-1.5 border-t border-slate-800 flex justify-end">
           <button 
             type="button"
             onClick={onClose}
             className="px-3 py-1 text-[9px] font-black text-slate-500 uppercase hover:text-white"
           >
             Cerrar
           </button>
        </div>
      </div>
    </div>
  );
}
