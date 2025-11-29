'use client';

import { useEffect, useState } from 'react';

interface FormattedDateProps {
    date: string | Date;
}

export default function FormattedDate({ date }: FormattedDateProps) {
    const [formattedDate, setFormattedDate] = useState<string>('');

    useEffect(() => {
        setFormattedDate(new Date(date).toLocaleDateString());
    }, [date]);

    if (!formattedDate) {
        return null; // Or a loading skeleton/placeholder
    }

    return <span>{formattedDate}</span>;
}
