'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Folder } from 'lucide-react';

interface Subject {
  _id: string;
  name: string;
  description: string;
  createdAt: string;
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then((data) => {
        setSubjects(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[50vh]">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Subjects</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => (
          <Link href={`/subject/${subject._id}`} key={subject._id} className="block">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300">
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <Folder className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{subject.name}</h3>
                    <p className="text-sm text-gray-500">{new Date(subject.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {subject.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-2">{subject.description}</p>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full text-center text-gray-500 py-12">
            No subjects found.
          </div>
        )}
      </div>
    </div>
  );
}
