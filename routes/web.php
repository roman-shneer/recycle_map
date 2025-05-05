<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Place;
#Route::get('/', function () {
#    return view('welcome');
#});

Route::get('/', function () {    
    return Inertia\Inertia::render('Map');
});

Route::get('/about', function () {
    return Inertia\Inertia::render('About');
});

Route::post('/place',function (Request $request){

    $input = $request->all();
    $place = new Place;
    $place->title=$input['title']??'';
    $place->from_time = $input['from_time']??'';
    $place->to_time = $input['to_time']??'';
    $place->cash = $input['cash'];
    $place->lat = $input['lat'];
    $place->lng = $input['lng'];
    $place->save();
    return json_encode(['result' => 'done', 'place' => $place]);
});

Route::delete('/place', function (Request $request) {
    $input = $request->all();
    $place = Place::find($input['id']);
    if ($place) {
        $place->delete();
    }
    return json_encode(['result' => 'done', 'removed' => $input['id']]);
});


Route::get('/places', function () {
    return json_encode(['places'=>Place::get()]);
});