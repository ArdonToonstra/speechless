import img1 from '@/img/michal-mancewicz-_wdOjxXPxUU-unsplash.jpg'
import img2 from '@/img/q-u-i-n-g-u-y-e-n-S6atLH5Rf0U-unsplash.jpg'
import img3 from '@/img/q-u-i-n-g-u-y-e-n-Zrp9b3PMIy8-unsplash.jpg'
import img4 from '@/img/rodan-can-KrwJwwqaGU4-unsplash.jpg'
import img5 from '@/img/the-free-birds-c19EYwrW-EU-unsplash.jpg'
import { StaticImageData } from 'next/image'

export interface Location {
    id: string
    slug: string
    name: string
    city: 'Amsterdam' | 'Amersfoort'
    type: 'Conference' | 'Meeting' | 'Studio' | 'Event Hall'
    capacity: number
    description: string
    image: StaticImageData
    details: {
        address: string
        amenities: string[]
    }
}

export const locations: Location[] = [
    {
        id: '1',
        slug: 'grand-canal-house',
        name: 'Grand Canal House',
        city: 'Amsterdam',
        type: 'Event Hall',
        capacity: 150,
        description: 'A historic canal house with a stunning view of the Prinsengracht. Perfect for elegant gatherings and prestigious events.',
        image: img1,
        details: {
            address: 'Prinsengracht 123, 1016 AB Amsterdam',
            amenities: ['Water View', 'Historic Interior', 'Catering Kitchen', 'Valet Parking'],
        },
    },
    {
        id: '2',
        slug: 'modern-tech-loft',
        name: 'Modern Tech Loft',
        city: 'Amsterdam',
        type: 'Meeting',
        capacity: 20,
        description: 'A sleek, modern loft space in the Houthavens. Ideal for creative brainstorming sessions and tech demos.',
        image: img2,
        details: {
            address: 'Danzigerkade 4, 1013 AP Amsterdam',
            amenities: ['High-speed WiFi', 'Smart Boards', 'Coffee Bar', 'Roof Terrace'],
        },
    },
    {
        id: '3',
        slug: 'creative-studio-west',
        name: 'Creative Studio West',
        city: 'Amsterdam',
        type: 'Studio',
        capacity: 50,
        description: 'An industrial studio space with high ceilings and abundant natural light. Great for workshops and photo shoots.',
        image: img3,
        details: {
            address: 'Overtoom 400, 1054 JS Amsterdam',
            amenities: ['Photography Lighting', 'Green Screen', 'Lounge Area', 'Kitchenette'],
        },
    },
    {
        id: '4',
        slug: 'amersfoort-conference-hub',
        name: 'Amersfoort Conference Hub',
        city: 'Amersfoort',
        type: 'Conference',
        capacity: 300,
        description: 'A state-of-the-art conference center located centrally in Amersfoort. Fully equipped for large-scale presentations.',
        image: img4,
        details: {
            address: 'Stationsplein 10, 3818 LE Amersfoort',
            amenities: ['Auditorium Seating', 'AV Control Room', 'Breakout Rooms', 'Underground Parking'],
        },
    },
    {
        id: '5',
        slug: 'historic-city-hall',
        name: 'Historic City Hall',
        city: 'Amersfoort',
        type: 'Event Hall',
        capacity: 100,
        description: 'Experience the charm of Amersfoort in this beautifully restored city hall venue. Atmosphere and history combined.',
        image: img5,
        details: {
            address: 'Hof 1, 3811 CJ Amersfoort',
            amenities: ['Classic Architecture', 'Grand Piano', 'Stage', 'Cloakroom'],
        },
    },
]
