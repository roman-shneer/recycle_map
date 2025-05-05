<script lang="ts">
import mapEngine from '../components/mapEngine.ts';
import axiosPro from '../components/axiosPro.js';
import { getCurrentInstance} from "vue";
import { toRaw } from "vue";

export default {   
    setup() {
        
        const instance:any = getCurrentInstance();
        const MapEngine = new mapEngine();
        //get and set places from server
        
        axiosPro.get('/places', {}, (response: { data: {places:object} }) => {
            MapEngine.setPlaces(response.data.places);                    
        });
        (instance as any).MapEngine = MapEngine;
        
    },   
    data() { 
        const MapEngine = (getCurrentInstance() as any).MapEngine;
        return {
            reportMode: false,
            reportForm: false,            
            reportFormConfirmation: false,
            reportExistForm: false,
            reportId: 0,           
            reportData:{
                'title': '',
                'from_time': '',
                'to_time': '',
                'cash': '0',
                'lat': 0,
                'lng':0,
                'status': 1
            },
            MapEngine :  MapEngine
        };
    },
    methods: {

        reloadPlaces() { 
            const MapEngine = toRaw(this.MapEngine);
            axiosPro.get('/places', {}, (response: { data: {places:object} }) => {
                MapEngine.setPlaces(response.data.places);                    
            });
        },

        reportModeStart() { 
            this.reportMode = true;
            const MapEngine = toRaw(this.MapEngine);
            MapEngine.setReportMode(true);
        },

        reportModeEnd() { 
            this.reportMode = false;
            const MapEngine = toRaw(this.MapEngine);
            MapEngine.setReportMode(false);
        },

        markerSet() {                            
            this.reportFormConfirmation = true;      
        },

        showEditForm() { 
            this.reportFormConfirmation = false;
            this.reportForm = true;
        },

        cancelMarker() { 
            this.reportFormConfirmation = false;
            const MapEngine = toRaw(this.MapEngine);
            MapEngine.cleanMarkers();
        },

        saveField(evt: any) {   
            const key = evt.target.dataset.field as keyof typeof this.reportData;                 
            if (key) {                 
                this.reportData[key] = evt.target.value;               
            }
        },

        
        saveReport() { 
            const MapEngine = toRaw(this.MapEngine);  
            const position = this.MapEngine.getLastPosition();
            if (position.lat && position.lng) { 
                this.reportData.lat = position.lat;
                this.reportData.lng = position.lng;
                axiosPro.post('/place', this.reportData, (response:any) => { 
                    console.log("saveReport response", response);
                    this.reportForm = false;
                    this.reportData={
                        'title': '',
                        'from_time': '',
                        'to_time': '',
                        'cash': '0',
                        'lat': 0,
                        'lng':0,
                        'status': 1
                        
                    };
                    MapEngine.changeMarker(response.data.place);                    
                    this.reportModeEnd();
                })
            }
            
        },
        ReportExistsPlace(evt: any) { 
            const MapEngine = toRaw(this.MapEngine);  
            if (evt.target.className == 'but_yes' && this.reportId>0) {
                console.log(this.reportId);
                
                axiosPro.delete('/place', { 'id': this.reportId }, (response:any) => { 
                    MapEngine.deleteMarker(response.data.removed); 
                });
            }
            this.reportExistForm = false;
            this.reportId = 0;
        },
        ReportAboutExistsPlace(data: { id: number }) {
            this.reportId=data.id;
            console.log("ReportAboutExistsPlace MAP.vue", data.id);
            this.reportExistForm = true;
        }
        
    },
    
    components: {
    },
        
    mounted() {     
        const MapEngine = toRaw(this.MapEngine);        
        MapEngine.markerSet = this.markerSet;
        MapEngine.setInputElement(document.getElementById('search') as HTMLInputElement);        
        console.log('mounted');
        MapEngine.initMap({ lat: 31.046051, lng: 34.851612 });
        MapEngine.getLocation();                    
        window.addEventListener("report_me", (e: CustomEvent) => this.ReportAboutExistsPlace(e.detail));
    }
}
</script>
<template>
    <div class="main">        
        <div class="report-form-confirmation" v-if="reportFormConfirmation">Its correct place? <button class="but_yes" @click="showEditForm">Yes</button> <button class="but_no" @click="cancelMarker">No</button></div>
        <div class="report-form" v-if="reportForm">
            <div class="report-form-row">
                <input type="text" placeholder="Title of place" class="title" data-field="title" @change="saveField" />
            </div>
            <div class="report-form-row">
                <label for="time_start" class="main_label">Opening time:</label>
                <input type="time" name="time_start" id="time_start" class="time_input"  data-field="from_time" @change="saveField"/>
                <input type="time" name="time_end" class="time_input"  data-field="to_time" @change="saveField"/>
            </div>
            <div class="report-form-row">
                <label class="main_label">Cash compensation</label>
                <span>
                    <label for="cash_yes">Yes</label><input type="radio" name="cash" value=1 id="cash_yes"  data-field="cash" @change="saveField"/>
                </span>
                <span>
                    <label for="cash_no">No</label><input type="radio" name="cash" value=0 id="cash_no"  data-field="cash" @change="saveField"/>
                </span>                
            </div>
            <div class="report-form-row">
                <button class="report-form-save" @click="saveReport">Save</button>
            </div>
        </div>
        <div class="report-form center" v-if="reportExistForm">
            <label>The place is missing?</label>
            <div>
                <button class="but_yes" @click="ReportExistsPlace">Yes</button>&nbsp;
                <button class="but_no" @click="ReportExistsPlace">No</button>
            </div>            
        </div>
        <div class="header">           
            <button class="report-btn" @click="reportModeStart" v-if="!reportMode">Report about new place</button>
            <div v-if="reportMode">Set Point on Map<button class="btn" @click="reportModeEnd">Cancel</button></div>
        </div>        
        <input type="text" id="search"/>
        <div class="map" id="map">
        
        </div>
        <div class="footer">           
            <a href="/about">About</a>
        </div>
    </div>
</template>

<style scoped>
.main{
    background: green;
}
.header{ 
    border:solid black 1px;
    height: 5vh;
    text-align: center;
}
.map{ 
    border:solid black 1px;
    height: 90vh;
}
.footer{ 
    height: 5vh;
    border:solid black 1px;
    text-align: center;
}
.report-btn{
    background:white;
    margin:5px auto;
    display:block;    
    padding:0px 20px;
    border-radius: 5px;
}
.btn{
    background:white;
    padding:0 2px;
    line-height: 1;
    border-radius: 1px;
    margin-left:5px;
    margin-top:2px;
}
.report-form{
    background: white;
    width: 80vw;
    height:60vh;
    position: absolute;
    top:20vh;
    left:10vw;
    z-index: 1;
    padding:25% 10px 10px 10px;
    border-radius: 5px;
}
.report-form-row{
    margin-bottom:20px;
}
.time_input{
    width:50px;
}
.title{
    border:solid gray 1px;
    width:100%;
}
.report-form-save{
    width:100%;
    background: green;
    color:white;
    border-radius: 5px;
}
.main_label{
    width:50%;
    display: inline-block;
}
.report-form-confirmation{
    position: absolute;
    top:10vh;
    width:60vw;
    left:10vw;
    z-index: 1;
    background: white;
    border:solid black 1px;
    padding:1vw;
    text-align: center;
}
.but_yes{
    background:green;
    color:#FFF;
    border-radius: 5px;
    padding:0 3px;
}
.but_no{
    background:red;
    color:#FFF;
    border-radius: 5px;
    padding:0 3px;
}
.center{
    text-align: center;
}
</style>