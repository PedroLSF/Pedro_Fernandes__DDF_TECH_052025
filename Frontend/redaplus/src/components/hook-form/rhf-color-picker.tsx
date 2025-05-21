import { ChromePicker } from 'react-color';
import React, { useRef, useState, useEffect, forwardRef } from 'react';

import { useTheme } from '@mui/material/styles';
import Box, { BoxProps } from '@mui/material/Box';

import { Color } from 'src/types/channel';

export interface ColorPickerProps extends BoxProps {
  disabledLink?: boolean;
  onSelectColor?: (color: string) => void;
  selectedColor?: string | null;
}

const ColorPicker = forwardRef<HTMLDivElement, ColorPickerProps>(
  ({ onSelectColor, selectedColor, sx, ...other }, ref) => {
    const theme = useTheme();
    const pickerRef = useRef<HTMLDivElement>(null);

    const [customColor, setCustomColor] = useState<string>('transparent'); // Inicialmente transparente
    const [currentColor, setCurrentColor] = useState<string | Color>(selectedColor || ''); // Rastreia a cor selecionada
    const [showPicker, setShowPicker] = useState<boolean>(false);

    const colors = [
      { id: 'red', color: '#f44336', label: 'Red', enumColor: Color.Red },
      { id: 'gray', color: '#cccccc', label: 'Gray', enumColor: Color.Gray },
      { id: 'green', color: '#4caf50', label: 'Green', enumColor: Color.Green },
      { id: 'blue', color: '#2196f3', label: 'Blue', enumColor: Color.Blue },
      { id: 'yellow', color: '#ffeb3b', label: 'Yellow', enumColor: Color.Yellow },
      { id: 'orange', color: '#ff9800', label: 'Orange', enumColor: Color.Orange },
    ];

    // Configura o estado inicial com base na cor selecionada
    useEffect(() => {
      if (selectedColor && /^#([0-9A-Fa-f]{3}){1,2}$/.test(selectedColor)) {
        setCustomColor(selectedColor);
        setCurrentColor(selectedColor);
      } else if (selectedColor) {
        setCurrentColor(selectedColor);
      }
    }, [selectedColor]);

    const handleCustomColorChange = (color: any) => {
      const hexColor = color.hex;
      setCustomColor(hexColor);
      setCurrentColor(hexColor); // Atualiza o estado para a cor personalizada
      onSelectColor?.(hexColor); // Envia o hexadecimal ao pai
    };

    const handleColorSelect = (enumColor: Color) => {
      setCurrentColor(enumColor); // Atualiza o estado para o enumColor
      onSelectColor?.(enumColor); // Envia o enumColor ao pai
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    };

    useEffect(() => {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <Box
        ref={ref}
        sx={{
          display: 'flex',
          gap: 2,
          justifyContent: 'start',
          alignItems: 'center',
          position: 'relative',
          ...sx,
        }}
        {...other}
      >
        {/* Bolinha do conta-gotas */}
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: customColor || 'white',
            cursor: 'pointer',
            border:
              currentColor === customColor
                ? `3px solid ${theme.palette.primary.main}`
                : '2px solid white',
            boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              transform: 'scale(1.1)',
              boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
            },
          }}
          title="Custom Color"
          onClick={() => setShowPicker((prev) => !prev)} // Alterna o estado de `showPicker`
        >
          🎨 {/* Ícone de conta-gotas */}
        </Box>

        {/* Outras bolinhas de cores */}
        {colors.map((color) => (
          <Box
            key={color.id}
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: color.color,
              cursor: 'pointer',
              border:
                currentColor === color.enumColor
                  ? `3px solid ${theme.palette.primary.main}`
                  : '2px solid white',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'scale(1.1)',
                boxShadow: '0px 6px 10px rgba(0, 0, 0, 0.15)',
              },
            }}
            title={color.label}
            onClick={() => handleColorSelect(color.enumColor)} // Envia `enumColor` para o pai
          />
        ))}

        {/* ChromePicker */}
        {showPicker && (
          <Box
            ref={pickerRef}
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: 0,
              zIndex: 1000,
              backgroundColor: '#fff',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              padding: { xs: 1, sm: 2 },
              borderRadius: 1,
              width: { xs: '90%', sm: 'auto' },
              maxWidth: '400px',
            }}
          >
            <ChromePicker color={customColor} onChangeComplete={handleCustomColorChange} />
          </Box>
        )}
      </Box>
    );
  }
);

export default ColorPicker;
