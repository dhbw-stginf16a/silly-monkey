package com.example.aiassistent;

import android.Manifest;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
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


import com.nuance.dragon.toolkit.core.data.Data;
import com.nuance.speechkit.Audio;
import com.nuance.speechkit.DetectionType;
import com.nuance.speechkit.Interpretation;
import com.nuance.speechkit.Language;
import com.nuance.speechkit.Session;
import com.nuance.speechkit.Transaction;
import com.nuance.speechkit.TransactionException;
import com.nuance.speechkit.Voice;

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
import java.util.Locale;
import java.util.concurrent.ExecutionException;

public class MainActivity extends AppCompatActivity {

    private TextToSpeech tts;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        final TextView mainTV = (TextView) findViewById(R.id.txtVO);

        final Session session = Session.Factory.session(this, Configuration.SERVER_URI, Configuration.APP_KEY);

        final Transaction.Options options = new Transaction.Options();
        options.setDetection(DetectionType.Short);
        options.setLanguage(new Language(Configuration.LANGUAGE));

        final JSONObject appServerData = new JSONObject();

        //Register Android TextToSpeech
        tts = new TextToSpeech(getApplicationContext(), new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                //mainTV.setText("Androids Text2Speech is ready");
            }
        });
        tts.setLanguage(Locale.US);


        FloatingActionButton fab = findViewById(R.id.fab);
        fab.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                mainTV.setText("Button clicked");

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
                            //JSONObject concepts = interpret_result.getJSONArray("interpretations").getJSONObject(0).getJSONObject("concepts");

                            //http://35.198.134.76/triggerRouter/trigger

                            switch (action_call){
                                case "getPersonalTrainer": {
                                    tts.speak("You called the PersonalTrainer", TextToSpeech.QUEUE_ADD, null);
                                    String time_value = "now";
                                    try {
                                        //time_value = concepts.getJSONArray("time_reference").getJSONObject(0).getString("value");

                                    } catch (Exception ex) {

                                    }
                                    getPersonalTrainer(time_value);
                                    break;
                                }
                                case "getWeather": {
                                    tts.speak("You called the WeatherApp", TextToSpeech.QUEUE_ADD, null);
                                    break;
                                }
                                case "getWelcome": {
                                    tts.speak("You called Jarvis", TextToSpeech.QUEUE_ADD, null);
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

    private static void speakk(final Session session, String text) {
        /*
        Transaction.Options options = new Transaction.Options();
        options.setLanguage(new Language(Configuration.LANGUAGE));
        //options.setVoice(new Voice(Voice)); //optional

        String textToSpeak = text;

        Transaction transaction = session.speakString(textToSpeak, options, new Transaction.Listener() {
            public void onAudio(Transaction transaction, Audio audio) {
                session.getAudioPlayer().playAudio(audio);
            }
            public void onSuccess(Transaction transaction, String s) {  }
            public void onError(Transaction transaction, String s, TransactionException e) { }
        });
        */



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
                            .put("time", time)));
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

}
