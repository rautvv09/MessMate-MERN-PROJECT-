import { useState } from 'react';

const Gallery = ({ images = [], messName }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
        No images available
      </div>
    );
  }

  return (
    <div>
      <div className="h-80 rounded-xl overflow-hidden mb-3">
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
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === activeIndex ? 'border-emerald-500' : 'border-transparent'
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