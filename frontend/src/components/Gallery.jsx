import { useState } from 'react';

const Gallery = ({ images = [], messName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-80 bg-background border border-dashed border-border rounded-2xl flex items-center justify-center text-text-muted text-xs font-bold">
        No images available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-80 rounded-2xl overflow-hidden border border-border shadow-xs">
        <img
          src={images[activeIndex].url}
          alt={`${messName} - photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.publicId}
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                index === activeIndex ? 'border-primary scale-105 shadow-xs' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;