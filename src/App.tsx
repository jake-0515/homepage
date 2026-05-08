/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import {
  School,
  Search,
  Users,
  DoorOpen,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { STUDENTS } from './constants';
import { Student } from './types';

const SCHOOL_NAME = '서울대학교사범대학부설여자중학교';

type Filter =
  | { name: 'All'; label: '전체 학생' }
  | { name: `Class${number}`; label: string; classNum: number };

const filters: Filter[] = [
  { name: 'All', label: '전체 학생' },
  { name: 'Class1', label: '3학년 1반', classNum: 1 },
  { name: 'Class2', label: '3학년 2반', classNum: 2 },
  { name: 'Class3', label: '3학년 3반', classNum: 3 },
  { name: 'Class4', label: '3학년 4반', classNum: 4 },
  { name: 'Class5', label: '3학년 5반', classNum: 5 },
  { name: 'Class6', label: '3학년 6반', classNum: 6 },
];

export default function App() {
  const [activeFilter, setActiveFilter] = useState<Filter['name']>('All');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const visibleStudents = STUDENTS.filter((s) => {
    if (activeFilter === 'All') return true;
    const f = filters.find((x) => x.name === activeFilter);
    return f && 'classNum' in f ? s.classNum === f.classNum : true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary-container selection:text-primary">
      {/* Top App Bar */}
      <header className="sticky top-0 w-full z-50 bg-background/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(59,45,0,0.08)] flex justify-between items-center px-6 md:px-8 py-4 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-secondary/10 rounded-xl shrink-0">
            <School className="text-secondary w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h1 className="text-sm sm:text-base md:text-xl lg:text-2xl font-black text-secondary font-headline tracking-tight truncate">
            {SCHOOL_NAME}
          </h1>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-primary-container/20 transition-colors active:scale-95 duration-200">
            <Search className="text-secondary w-5 h-5" />
            <span className="font-headline font-bold text-secondary hidden sm:inline">검색</span>
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-full hover:bg-primary-container/20 text-secondary"
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Navigation Drawer (Desktop) */}
        <aside className="hidden lg:flex sticky top-20 h-[calc(100vh-5rem)] w-64 flex-col p-4 font-medium border-r border-primary/10">
          <h2 className="px-6 py-4 text-secondary text-xs font-bold uppercase tracking-widest">필터</h2>
          <nav className="space-y-2">
            {filters.map((filter) => {
              const Icon = filter.name === 'All' ? Users : DoorOpen;
              return (
                <button
                  key={filter.name}
                  onClick={() => setActiveFilter(filter.name)}
                  className={`w-full flex items-center gap-4 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                    activeFilter === filter.name
                      ? 'bg-primary-container text-primary shadow-sm'
                      : 'text-primary hover:bg-primary-container/20'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
              />
              <motion.aside
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                className="fixed left-0 top-0 h-full w-64 bg-background z-50 p-4 lg:hidden shadow-2xl overflow-y-auto"
              >
                <div className="flex items-center gap-3 mb-8 px-4 pt-4">
                  <School className="text-secondary w-6 h-6" />
                  <span className="font-headline font-bold text-secondary">메뉴</span>
                </div>
                <nav className="space-y-2">
                  {filters.map((filter) => {
                    const Icon = filter.name === 'All' ? Users : DoorOpen;
                    return (
                      <button
                        key={filter.name}
                        onClick={() => {
                          setActiveFilter(filter.name);
                          setIsSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-4 px-6 py-3 rounded-full font-bold transition-all duration-300 ${
                          activeFilter === filter.name
                            ? 'bg-primary-container text-primary'
                            : 'text-primary hover:bg-primary-container/20'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{filter.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-12 pb-32 md:pb-12">
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-6xl font-headline font-extrabold text-primary mb-4 leading-tight tracking-tight">
              학생 갤러리
            </h2>
            <p className="text-on-surface-variant max-w-xl text-lg font-medium leading-relaxed">
              학술 아틀리에에 오신 것을 환영합니다. 2026학년도 학생들의 자기소개를 살펴보세요.
            </p>
          </motion.header>

          {/* Student Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-16">
            {visibleStudents.map((student, index) => (
              <StudentCard key={student.id} student={student} index={index} />
            ))}
          </div>
          {visibleStudents.length === 0 && (
            <p className="text-on-surface-variant mt-8">해당 반에 학생이 없습니다.</p>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="w-full bg-background py-12 px-8 md:px-12 flex flex-col md:flex-row justify-between items-center border-t border-primary/10 font-body text-xs uppercase tracking-widest text-primary font-bold">
        <div className="mb-6 md:mb-0 text-center md:text-left opacity-60">
          © 2026 {SCHOOL_NAME} | 학술 아틀리에
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: '개인정보 처리방침', key: 'Privacy Policy' },
            { label: '교직원 포털', key: 'Staff Portal' },
            { label: '고객 지원', key: 'Support' }
          ].map((link) => (
            <a
              key={link.key}
              href="#"
              className="hover:text-secondary transition-colors hover:opacity-100 opacity-60"
            >
              {link.label}
            </a>
          ))}
        </div>
      </footer>

      {/* Bottom Navigation Bar (Mobile Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-xl border-t border-primary/10 h-20 flex justify-around items-center px-2 z-40 overflow-x-auto">
        {filters.map((filter) => {
          const Icon = filter.name === 'All' ? Users : DoorOpen;
          return (
            <button
              key={filter.name}
              onClick={() => setActiveFilter(filter.name)}
              className={`flex flex-col items-center gap-1 transition-colors shrink-0 px-2 ${
                activeFilter === filter.name ? 'text-secondary' : 'text-primary opacity-60'
              }`}
            >
              <Icon className={`w-6 h-6 ${activeFilter === filter.name ? 'fill-current' : ''}`} />
              <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface StudentCardProps {
  student: Student;
  index: number;
  key?: number;
}

function StudentCard({ student, index }: StudentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: (index % 4) * 0.1 }}
      whileHover={{ y: -8 }}
      className="bg-surface-container-highest rounded-3xl p-6 pt-16 relative flex flex-col items-center text-center group shadow-sm hover:shadow-xl transition-shadow duration-300"
    >
      <div className="absolute -top-10 w-24 h-24 rounded-full border-4 border-background overflow-hidden shadow-xl group-hover:scale-110 transition-transform duration-300 bg-primary-container">
        <img
          className="w-full h-full object-cover"
          src={student.image}
          alt={student.alt}
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="w-full">
        <span className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] mb-2 block opacity-80">
          {student.grade}학년 {student.classNum}반
        </span>
        <h3 className="text-xl font-headline font-extrabold text-on-surface mb-6 tracking-tight">
          {student.name}
        </h3>
        <button className="w-full py-3.5 bg-secondary text-on-secondary rounded-2xl font-headline font-bold hover:bg-secondary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group/btn shadow-lg shadow-secondary/20">
          더 보기
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
