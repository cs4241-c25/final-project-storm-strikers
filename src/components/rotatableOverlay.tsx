import { useMap } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";

function rotateImage(base64Image: string, rotationAngle: number) {
  return new Promise<string>((resolve) => {
    const image = new Image();
    image.src = base64Image;
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const canvasContext2d = canvas.getContext("2d");

      const angleRadians = (rotationAngle * Math.PI) / 180;

      const sin = Math.abs(Math.sin(angleRadians));
      const cos = Math.abs(Math.cos(angleRadians));
      const newWidth = image.width * cos + image.height * sin;
      const newHeight = image.width * sin + image.height * cos;

      canvas.width = newWidth;
      canvas.height = newHeight;

      canvasContext2d?.translate(newWidth / 2, newHeight / 2);
      canvasContext2d?.rotate(angleRadians);
      canvasContext2d?.translate(-image.width / 2, -image.height / 2);

      canvasContext2d?.drawImage(image, 0, 0);

      resolve(canvas.toDataURL("image/png", 1.0));
    };
  });
}

export function RotatableOverlay({
  image,
  rotation,
  bounds,
}: {
  image: string;
  rotation: number;
  bounds: google.maps.LatLngBoundsLiteral;
}) {
  const map = useMap();

  const [finalImage, setFinalImage] = useState(image);
  useEffect(() => {
    async function renderImage() {
      setFinalImage(await rotateImage(image, rotation));
    }
    renderImage();
  }, [image, rotation]);

  useEffect(() => {
    const createdGroundOverlay = new google.maps.GroundOverlay(
      finalImage,
      bounds,
      {
        map,
      },
    );

    return () => createdGroundOverlay.setMap(null); // clear old overlay
  }, [bounds, finalImage, map]);

  return <></>;
}
