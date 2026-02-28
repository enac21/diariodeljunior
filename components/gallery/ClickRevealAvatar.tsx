import { useState, useEffect } from 'react';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import { useRevealedStore } from '@/lib/stores/revealed-store';

interface ClickRevealAvatarProps {
    src: string;
    alt: string;
    width: number;
    height: number;
    className?: string;
    characterId: string;
}

export function ClickRevealAvatar({ src, alt, width, height, className = '', characterId }: ClickRevealAvatarProps) {
    const isRevealed = useRevealedStore((state) => state.isRevealed(characterId));
    const revealCharacter = useRevealedStore((state) => state.revealCharacter);
    const [revealed, setRevealed] = useState(false);

    useEffect(() => {
        if (isRevealed) {
            setRevealed(true);
        }
    }, [isRevealed]);

    const handleReveal = (e: React.MouseEvent) => {
        if (revealed) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        confetti({
            particleCount: 50,
            spread: 60,
            origin: { x, y },
            colors: ['#f97316', '#f59e0b', '#fbbf24', '#ffffff']
        });

        setRevealed(true);
        revealCharacter(characterId);
    };

    return (
        <div
            className={`relative h-full w-full cursor-pointer overflow-hidden ${className}`}
            onClick={handleReveal}
        >
            <Image
                src={src}
                alt={alt}
                width={width}
                height={height}
                className={`object-contain transition-opacity duration-700 ease-out ${revealed ? 'opacity-100' : 'opacity-0'
                    }`}
                priority={false}
            />

            <div
                className={`absolute inset-0 z-10 flex items-center justify-center transition-all duration-700 ease-out ${revealed ? 'scale-110 opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
            >
                <div
                    className="absolute inset-0 opacity-80"
                    style={{
                        backgroundImage: 'url(/logo.png)',
                        backgroundSize: '40px',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'repeat',
                        transform: 'rotate(-15deg) scale(1.5)',
                        filter: 'grayscale(0.2) brightness(0.9)',
                    }}
                />

                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px]" />

                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary/20 ring-2 ring-primary/40 backdrop-blur-md transition-transform hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary drop-shadow-md">
                        <polyline points="20 12 20 22 4 22 4 12"></polyline>
                        <rect x="2" y="7" width="20" height="5"></rect>
                        <line x1="12" y1="22" x2="12" y2="7"></line>
                        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
                        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
                    </svg>
                </div>
            </div>
        </div>
    );
}
