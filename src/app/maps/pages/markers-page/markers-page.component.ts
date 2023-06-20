import { Component, ElementRef, ViewChild } from '@angular/core';
import { Map, LngLat, Marker } from 'mapbox-gl';

interface MarkerAndColor {
  color: string,
  marker: Marker
}

interface PlainMarker {
  color: string,
  lnglat: number[]
}

@Component({
  selector: 'app-markers-page',
  templateUrl: './markers-page.component.html',
  styleUrls: ['./markers-page.component.css']
})
export class MarkersPageComponent {
  @ViewChild('map')
  public divMap?: ElementRef;

  public map?: Map;
  public currentLngLat: LngLat = new LngLat(-101.13117565385672, 20.21425237200981);
  public markers: MarkerAndColor[] = [];

  ngAfterViewInit(): void {

    if (!this.divMap) throw 'El elemento HTML no fue encontrado';

    this.map = new Map({
      container: this.divMap.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v12', // style URL
      center: this.currentLngLat, // starting position [lng, lat]
      zoom: 14, // starting zoom
    });

    this.readFromLocalStorage();

    /* -------Como crear un marcador en MapBox

          const markerHtml = document.createElement('DIV');
          markerHtml.innerHTML = 'Diego Abarca';

          const marker = new Marker({
            element: markerHtml,
            color: 'red'
          },).setLngLat(this.currentLngLat).addTo(this.map);
          */
  }

  createMarker() {
    if (!this.map) return;

    const color: string = '#xxxxxx'.replace(/x/g, y => (Math.random() * 16 | 0).toString(16));
    const ltnLat: LngLat = this.map.getCenter();

    this.addMarker(ltnLat, color);
  }

  addMarker(ltnLat: LngLat, color: string) {
    if (!this.map) return;

    const marker = new Marker({
      color,
      draggable: true
    }).setLngLat(ltnLat).addTo(this.map);

    this.markers.push({ color, marker });
    this.saveToLocalStorage();

    marker.on('dragend', () => {
      this.saveToLocalStorage();
    })
  }

  deleteMarker(index: number) {
    this.markers[index].marker.remove();
    this.markers.splice(index, 1);
  }

  flyTo(marker: Marker) {
    this.map?.flyTo({
      zoom: 16,
      center: marker.getLngLat()
    });
  }

  saveToLocalStorage() {
    const plainMarkers: PlainMarker[] = this.markers.map(({ color, marker }) => {
      return {
        color,
        lnglat: marker.getLngLat().toArray()
      }
    });

    localStorage.setItem('plainMarkers', JSON.stringify(plainMarkers));
  }

  readFromLocalStorage() {
    const plainMarkersString = localStorage.getItem('plainMarkers') ?? '[]';
    const planMarkers: PlainMarker[] = JSON.parse(plainMarkersString);//!Ojo no necesariamente se retorna en el formato de la interfaz PlainMarker

    planMarkers.forEach(({ color, lnglat }) => {
      const [lng, lat] = lnglat;
      const coords = new LngLat(lng, lat);

      this.addMarker(coords, color);


    })
  }
}
