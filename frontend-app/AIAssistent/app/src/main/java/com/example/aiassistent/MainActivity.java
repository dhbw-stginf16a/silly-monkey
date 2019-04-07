package com.example.aiassistent;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.support.annotation.NonNull;
import android.support.annotation.RequiresApi;
import android.support.design.widget.FloatingActionButton;
import android.support.design.widget.Snackbar;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.TextView;
import android.widget.ThemedSpinnerAdapter;


import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;
import com.nuance.dragon.toolkit.core.data.Data;
import com.nuance.dragon.toolkit.edr.internal.jni.StringArray;
import com.nuance.speechkit.Audio;
import com.nuance.speechkit.DetectionType;
import com.nuance.speechkit.Interpretation;
import com.nuance.speechkit.Language;
import com.nuance.speechkit.Session;
import com.nuance.speechkit.Transaction;
import com.nuance.speechkit.TransactionException;
import com.nuance.speechkit.Voice;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import org.w3c.dom.Text;

import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.ProtocolException;
import java.net.URL;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Hashtable;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.ExecutionException;

public class MainActivity extends AppCompatActivity {

    private TextToSpeech tts;
    private Session session;
    private Transaction.Options options;
    private JSONObject appServerData;

    private TextView mainTV;

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        toolbar.setOnMenuItemClickListener(new Toolbar.OnMenuItemClickListener() {
            @Override
            public boolean onMenuItemClick(MenuItem menuItem) {
                if(menuItem.getTitle().equals("Settings")){

                    checkSetupStatus();


                }else{
                    Log.d("Toolbar", "This is: " + menuItem.getTitle());
                }
                return true;
            }
        });

        mainTV = (TextView) findViewById(R.id.txtVO);

        session = Session.Factory.session(this, Configuration.SERVER_URI, Configuration.APP_KEY);

        options = new Transaction.Options();
        options.setDetection(DetectionType.Short);
        options.setLanguage(new Language(Configuration.LANGUAGE));

        appServerData = new JSONObject();

        //Register Android TextToSpeech
        tts = new TextToSpeech(getApplicationContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                //mainTV.setText("Androids Text2Speech is ready");
            }
        });
        tts.setLanguage(Locale.US);

        //Setup the Assistent if needed



        initButtonListener();



        //Subscribe for FCM
        FirebaseMessaging.getInstance().subscribeToTopic("proactive");

    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }

    private void initButtonListener(){

        FloatingActionButton delete_setup = findViewById(R.id.delete_setup);
        delete_setup.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                Log.d("BUTTON","Clicked Delete Button");
                try {


                    new Thread(new Runnable() {
                        @Override
                        public void run() {
                            Log.d("BTN_DELETE", "Thread Running");

                            try {
                                HttpURLConnection con = (HttpURLConnection) (new URL("https://silly-monkey.danielschaefer.me/triggerRouter/setup")).openConnection();
                                con.setRequestMethod("DELETE");

                                if(con.getResponseCode() == 200){
                                    System.exit(0);
                                }else {
                                    mainTV.setText("Failed to reset");
                                }

                            } catch (Exception ex) {
                                Log.d("HTTP_ERROR", "Error in HTTPRequest: " + ex);
                            }
                        }
                    }).start();
                } catch (Exception ex){
                    Log.d("Button_delete", "Thread, Delete Error" + ex);
                }

            }
        });

        FloatingActionButton stop_speech = findViewById(R.id.stop_speak);
        stop_speech.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                Log.d("BTN_StopTSS", "Trying to stop TTS");
                try{
                    tts.stop();
                }catch (Exception ex){
                    Log.d("BTN_StopTSS", "Unable to stop " + ex);
                }

            }
        });
        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mainTV.setText("Button clicked");
                tts.stop();
                Transaction transaction = session.recognizeWithService(Configuration.CONTEXT_TAG, appServerData, options, new Transaction.Listener() {
                    public void onStartedRecording(Transaction transaction) {
                        mainTV.setText("Starting");

                    }
                    public void onFinishedRecording(Transaction transaction) {

                    }
                    public void onInterpretation(Transaction transaction, Interpretation interpretation) {
                        try {
                            JSONObject interpret_result = interpretation.getResult();

                            mainTV.setText("\nonInterpretation: " + interpret_result.toString(2));
                            //speak(session,"Hallo das ist ein test");

                            //tts.speak("Say my name, David Guetta is the best. Let me hear ya", TextToSpeech.QUEUE_ADD, null);
                            //parse the action call
                            String action_call = interpret_result.getJSONArray("interpretations").getJSONObject(0).getJSONObject("action").getJSONObject("intent").getString("value");

                            //http://35.198.134.76/triggerRouter/trigger

                            switch (action_call){
                                case "getPersonalTrainer": {
                                    JSONObject concepts = interpret_result.getJSONArray("interpretations").getJSONObject(0).getJSONObject("concepts");
                                    String time_value = concepts.getJSONArray("time_reference").getJSONObject(0).getString("literal");
                                    if(time_value=="now"){ time_value = "today"; }; // I dont want to talk about it
                                    getPersonalTrainer(time_value);
                                    break;
                                }
                                case "getMissed":{
                                    getPersonalTrainer("today");                                    break;
                                }
                                case "getWelcome": {
                                    getWelcome();
                                    break;
                                }
                                case "getOverview": {
                                    getOverview("overview");
                                    break;
                                }
                                case "getMeetings": {
                                    getOverview("meetings");
                                    break;
                                }
                                case "getTraffic": {
                                    getOverview("traffic");
                                    break;
                                }
                                case "getHomeOffice": {
                                    getHomeOffice();
                                    break;
                                }
                                default: {

                                }
                            }

                        } catch (JSONException e) {
                            e.printStackTrace();
                        }

                    }
                    public void onSuccess(Transaction transaction, String s) {

                    }
                    public void onError(Transaction transaction, String s, TransactionException e) {

                    }
                });


            }
        });
    }

    private static String makeHTTPRequest(JSONObject put_obj){

        try {
            HttpURLConnection con = (HttpURLConnection) ( new URL("https://silly-monkey.danielschaefer.me/triggerRouter/trigger")).openConnection();
            con.setRequestMethod("POST");
            con.setDoInput(true);
            con.setDoOutput(true);
            con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            con.connect();
            con.getOutputStream().write(put_obj.toString().getBytes());

            InputStream is = con.getInputStream();
            byte[] b = new byte[1024];
            StringBuilder buffer = new StringBuilder();

            while ( is.read(b) != -1)
                buffer.append(new String(b));
            con.disconnect();

            JSONObject response = new JSONObject(buffer.toString());
            String answer = response.getString("answer");
            return answer;

        } catch (Exception ex) {
            Log.d("HTTP_ERROR","Error in HTTPRequest: " + ex);
            return "Try again later";
        }

    };

    private void getPersonalTrainer(String time){

        final JSONObject trigger_reg = new JSONObject();

        try {
            trigger_reg.put("trigger", new JSONObject()
                    .put("type", "PersonalTrainer")
                    .put("parameters", new JSONObject()
                            .put("date", time)));
        } catch (Exception ex){

        }
        new Thread(new Runnable(){
            @Override
            public void run() {
                String resp = makeHTTPRequest(trigger_reg);
                tts.speak(resp, TextToSpeech.QUEUE_ADD, null);
            }
        }).start();

    };

    private void getWelcome(){
        final JSONObject trigger_reg = new JSONObject();

        try {
            trigger_reg.put("trigger", new JSONObject()
                    .put("type", "GoodMorning")
                    .put("parameters", new JSONObject()));
        } catch (Exception ex){

        }
        new Thread(new Runnable(){
            @Override
            public void run() {
                String resp = makeHTTPRequest(trigger_reg);
                tts.speak(resp, TextToSpeech.QUEUE_ADD, null);
            }
        }).start();


    };

    private void getOverview(String key){
        final JSONObject trigger_reg = new JSONObject();

        try {
            trigger_reg.put("trigger", new JSONObject()
                    .put("type", "DailyOverview")
                    .put("parameters", new JSONObject()
                            .put("type", key)));
        } catch (Exception ex){

        }
        new Thread(new Runnable(){
            @Override
            public void run() {
                String resp = makeHTTPRequest(trigger_reg);
                tts.speak(resp, TextToSpeech.QUEUE_ADD, null);
            }
        }).start();
    };

    private void getHomeOffice(){
        final JSONObject trigger_reg = new JSONObject();

        try {
            trigger_reg.put("trigger", new JSONObject()
                    .put("type", "HomeOffice")
                    .put("parameters", new JSONObject()));
        } catch (Exception ex){

        }
        new Thread(new Runnable(){
            @Override
            public void run() {
                String resp = makeHTTPRequest(trigger_reg);
                tts.speak(resp, TextToSpeech.QUEUE_ADD, null);
            }
        }).start();

    }


    private void setSetup(List<String> missing_key_list){
        if(missing_key_list.size() == 0){
            tts.speak("Thank you. The Setup is complete.", TextToSpeech.QUEUE_ADD, null);
            while(tts.isSpeaking()){
            }
            return;
        }


        List<String> oldList = new ArrayList<String>(missing_key_list);

//        try{
//            Collections.copy(oldList, missing_key_list);
//        }catch (Exception e) {
//            Log.d("setSetup Error", e.toString());
//        }

        final String missing_key = missing_key_list.get(0);
        missing_key_list.remove(0);

        runOnUiThread(new Runnable() {
            @Override
            public void run() {

                tts.speak("Please tell us about your " + missing_key, TextToSpeech.QUEUE_ADD, null);
                while(tts.isSpeaking()){
                }

                Transaction transaction = session.recognizeWithService(Configuration.CONTEXT_TAG, appServerData, options, new Transaction.Listener() {
                    public void onStartedRecording(Transaction transaction) {

                    }
                    public void onFinishedRecording(Transaction transaction) {

                    }
                    public void onInterpretation(Transaction transaction, Interpretation interpretation) {

                        List<String> passing_key_list = missing_key_list;

                        JSONObject interpret_result = interpretation.getResult();

                        try {
                            JSONObject first_interpretation = interpret_result.getJSONArray("interpretations").getJSONObject(0);

                            String action_call = first_interpretation.getJSONObject("action").getJSONObject("intent").getString("value");
                            Double confidence = Double.parseDouble(first_interpretation.getJSONObject("action").getJSONObject("intent").getString("confidence"));
                            //The response from the User made sense and is possible an answer to our question

                            if(action_call.equals("getSetup") && confidence.compareTo(0.80) == 1){
                                Log.d("setSetup", "Action call and confidence confirmed");

                                JSONObject concepts = first_interpretation.getJSONObject("concepts");

                                JSONArray missing_key_concept = concepts.getJSONArray(missing_key);
                                Log.d("setSetup", "missing_key_concept values" + first_interpretation);

                                if(missing_key_concept != null){
                                    //get Info Values and Package it into an array to send to trigger router
                                    List<String> missing_information_list = new ArrayList<String>();
                                    for(int i = 0; i < missing_key_concept.length(); i++){
                                        String kc = missing_key_concept.getJSONObject(i).getString("literal");
                                        missing_information_list.add(kc);
                                    }
                                    Log.d("SETUP", missing_key + " " + missing_information_list);
                                    //Update the backend with an HTTP Request and the missing information
                                    new Thread(new Runnable() {
                                        @Override
                                        public void run() {
                                            Log.d("SETUP","THREAD");

                                            if (missing_key.equals("city")) {
                                                if (missing_information_list.contains("Stuttgart")) {
                                                    updateSetup("Stuttgart", "city");
                                                    updateSetup("Stuttgart", "location");

                                                    updateSetup("Hohenlohe/mittlerer Neckar/Oberschwaben", "partRegion");
                                                    updateSetup("Hohenlohe/mittlerer Neckar/Oberschwaben", "region");
                                                } else if (missing_information_list.contains("Berlin")) {
                                                    updateSetup("Berlin", "city");
                                                    updateSetup("Berlin", "location");

                                                    updateSetup("Brandenburg und Berlin", "partRegion");
                                                    updateSetup("Brandenburg und Berlin", "region");
                                                } else if (missing_information_list.contains("Munich")) {
                                                    updateSetup("Munich", "city");
                                                    updateSetup("Munich", "location");

                                                    updateSetup("Allgäu/Oberbayern/Bay. Wald", "partRegion");
                                                    updateSetup("Allgäu/Oberbayern/Bay. Wald", "region");
                                                } else if (missing_information_list.contains("Frankfurt")) {
                                                    updateSetup("Frankfurt", "city");
                                                    updateSetup("Frankfurt", "location");

                                                    updateSetup("Rhein-Main", "partRegion");
                                                    updateSetup("Rhein-Main", "region");
                                                }

                                            } else if(missing_key.equals("allergies")) {
                                                Hashtable<String,String> ht=new Hashtable<String,String>();
                                                ht.put("alder", "Erle");
                                                ht.put("ambrosia", "ambrosia");
                                                ht.put("ash", "Asche");
                                                ht.put("birch", "Birke");
                                                ht.put("grasses", "Gräser");
                                                ht.put("hazel", "Hasel");
                                                ht.put("mugwort", "Beifuß");
                                                ht.put("rye", "Roggen");

                                                List<String> ger_allergies = new ArrayList<>();

                                                missing_information_list.forEach(el -> ger_allergies.add(ht.get(el)));
                                                updateSetup(ger_allergies.toString(), missing_key);

                                            } else {
                                                updateSetup(missing_information_list.toString(), missing_key);
                                            }
                                        }
                                    }).start();
                                }

                            }else{
                                //User was not understood
                                //Add Key back to list and call recursive
                                passing_key_list = oldList;
                                tts.speak("Sorry I could not understand you", TextToSpeech.QUEUE_ADD, null);
                                while(tts.isSpeaking()){
                                }
                            }
                        } catch (Exception e){
                            Log.d("ERROR S2T INT","setSetup, onInterpretation: " + e);

                        }
                        Log.d("setSetup", oldList.toString());
                        //Recursive Call for further setups
                        setSetup(passing_key_list);

                    }
                    public void onSuccess(Transaction transaction, String s) {

                    }
                    public void onError(Transaction transaction, String s, TransactionException e) {
                        tts.speak("Sorry I could not understand you", TextToSpeech.QUEUE_ADD, null);
                        while(tts.isSpeaking()){
                        }
                        setSetup(oldList);
                    }
                });

            }
        });

    }

    private void updateSetup(String values, String key){

        final JSONObject config_req = new JSONObject();

        try {
            config_req.put("setup", new JSONObject()
                    .put(key, values));
            Log.d("updateSetup", config_req.toString());
        } catch (Exception e){
            Log.d("ERROR_THREADRUN","Error in JSONObj Setup: " + e);

        }

        try {
            HttpURLConnection con = (HttpURLConnection) (new URL("https://silly-monkey.danielschaefer.me/triggerRouter/setup")).openConnection();
            con.setRequestMethod("POST");
            con.setDoInput(true);
            con.setDoOutput(true);
            con.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
            con.connect();
            con.getOutputStream().write(config_req.toString().getBytes());
            Log.d("updateSetup", "HTTP Request Code:" + con.getResponseCode());
        } catch (Exception e){
            Log.d("ERROR_THREADRUN","Error in HTTPRequest: " + e);

        }

    }

    @RequiresApi(api = Build.VERSION_CODES.N)
    private void checkSetupStatus() {


        new Thread(new Runnable() {
                @Override
                public void run() {
                    try{
/*
                        HttpURLConnection con = (HttpURLConnection) ( new URL("https://silly-monkey.danielschaefer.me/triggerRouter/setup")).openConnection();
                        con.setRequestMethod("GET");
                        con.getResponseCode();

                        InputStream is = con.getInputStream();
                        byte[] b = new byte[1024];
                        StringBuilder buffer = new StringBuilder();

                        while ( is.read(b) != -1)
                            buffer.append(new String(b));
                        con.disconnect();

                        JSONObject response = new JSONObject(buffer.toString());
                        Boolean answer = Boolean.parseBoolean(response.getString("fullySetup"));

                        List<String> list = new ArrayList<String>();

                        if(answer == false){
//                response.getJSONObject("setup").keys().forEachRemaining(a -> list.add(a));
                            JSONArray unset_values = response.getJSONArray("unset");
                            for(int i = 0; i < unset_values.length(); i++){

                                String ind_key = unset_values.getString(i);

                                if(!ind_key.equals("region")){
                                    list.add(ind_key);
                                }
                            }
                        }
                        */
                        //We now just override keys, no need to fetch unset ones

                        List<String> list = new ArrayList<String>();
                        list.add("allergies");
                        list.add("city");
                        setSetup(list);

/*                        if(list.size() > 0){
                            list.forEach(key -> {
                                if(key != "region" ) {
                                    setSetup(key);
                                } });
                        }
                        */


                    }catch (Exception e){
                        Log.d("ERROR HTTP","checkSetupStatus Thread: " + e);
                    }




                }
            }).start();


    }
}
