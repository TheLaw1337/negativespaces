package org.love2d.android;

import org.love2d.android.GameActivity;
import com.google.android.gms.ads.reward.*;
import com.google.android.gms.ads.*; // import library
import com.google.android.gms.ads.MobileAds;

import java.util.List;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

import android.app.Activity;
import android.app.DownloadManager;
import android.app.ProgressDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.os.Environment;
import android.os.Handler;
import android.os.PowerManager;
import android.os.ResultReceiver;
import android.os.Vibrator;
import android.util.Log;
import android.util.DisplayMetrics;
import android.widget.Toast;
import android.view.*;
import android.content.pm.PackageManager;
import android.widget.RelativeLayout;

public class AdActivity extends GameActivity {
	
	private String appID = "INSERT-YOUR-APP-ID-HERE";
	
	private AdRequest adRequest;
	
	//Banner stuff
	private AdView mAdView;
	private boolean hasBanner = false;
	private boolean bannerVisibile = false;
	private boolean bannerHasFinishedLoading = false;
	
	//Interstitial stuff
	private InterstitialAd mInterstitialAd;
	private boolean hasInterstitial = false;
	private boolean interstitialLoaded = false;
	
	//Rewarded video stuff
	private RewardedVideoAd mRewardedAd;
	private boolean hasRewardedVideo = false;
	private boolean rewardedAdLoaded = false;
	
	//For callbacks
	private boolean interstitialDidClose = false;
	private boolean interstitialDidFailToLoad = false;
	
	private boolean rewardedAdDidFinish = false;
	private boolean rewardedAdDidStop = false;
	private boolean rewardedAdDidFailToLoad = false;
	private double rewardQty;
	private String rewardType;
	
	public void createRewardedVideo()
	{
		mRewardedAd = MobileAds.getRewardedVideoAdInstance(this);
		mRewardedAd.setRewardedVideoAdListener(new RewardedVideoAdListener() {
			@Override
			public void onRewarded(RewardItem reward) {
				Log.d("AdActivity","onRewarded");
				rewardedAdDidFinish = true;
				rewardQty = reward.getAmount();
				rewardType = reward.getType();
			}

			@Override
			public void onRewardedVideoAdClosed() 
			{
				Log.d("AdActivity","onRewardedVideoAdClosed");
				rewardedAdDidStop = true;
			}

			@Override
			public void onRewardedVideoAdFailedToLoad(int errorCode)
			{
				Log.d("AdActivity","onRewardedVideoAdFailedToLoad: Error " + errorCode);
				rewardedAdDidFailToLoad = true;
			}
			
			@Override
			public void onRewardedVideoAdLeftApplication() 
			{
			}
			
			@Override
			public void onRewardedVideoStarted() 
			{
			}
			
			@Override
			public void onRewardedVideoAdLoaded() 
			{
				rewardedAdLoaded = true;
				Log.d("AdActivity","rewardedDidReceive");
			}

			@Override
			public void onRewardedVideoAdOpened()
			{
				rewardedAdLoaded = false;
			}

		});
	}

	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		if (appID.equals("INSERT-YOUR-APP-ID-HERE"))
		{
			Log.d("AdActivity","Initializing SDK without appID");
			MobileAds.initialize(this);
		}
		else
		{
			Log.d("AdActivity","Initializing SDK with appID");
			MobileAds.initialize(this, appID);
		}	
		createRewardedVideo();
	}

	@Override
	protected void onStart() {
		super.onStart();
	}
	
	@Override
    protected void onDestroy() {
      super.onDestroy();
	  if (hasBanner) {
			mAdView.destroy();
		}
    }

    @Override
    protected void onPause() {
      super.onPause();
	  if (hasBanner) {
			mAdView.pause();
		}
    }

    @Override
    public void onResume() {
      super.onResume();
	  if (hasBanner) {
			mAdView.resume();
		}
    }
	
	
	public void createBanner(final String adID,final String position)
	{
		Log.d("AdActivity","CreateBanner");
		runOnUiThread(new Runnable(){
			@Override
			public void run() { 
				if (!hasBanner){
					mAdView = new AdView(mSingleton);
					mAdView.setAdUnitId(adID);

					mAdView.setAdSize(AdSize.SMART_BANNER);
			
					AdSize adSize = mAdView.getAdSize();

					RelativeLayout container = new RelativeLayout(mSingleton);
					RelativeLayout.LayoutParams params = new RelativeLayout.LayoutParams(RelativeLayout.LayoutParams.WRAP_CONTENT, RelativeLayout.LayoutParams.WRAP_CONTENT);

					params.leftMargin = (metrics.widthPixels/2) - (adSize.getWidthInPixels(context)/2);
					if (position.trim().equals("bottom")) {
						params.topMargin = metrics.heightPixels - adSize.getHeightInPixels(context);
					}

					adRequest = new AdRequest.Builder().build();
					mAdView.loadAd(adRequest);

					container.addView(mAdView, params);
					mLayout.addView(container);

					//if showBanner() has been called display the banner, else prevent it from appearing.
					mAdView.setAdListener(new AdListener(){
						@Override
						public void onAdLoaded() {
							if (bannerVisibile)
							{	
								mAdView.setVisibility(View.GONE);
								mAdView.setVisibility(View.VISIBLE);
							}
							else
							{
								mAdView.setVisibility(View.GONE);
							}
							Log.d("AdActivity","onAdLoaded: " + bannerVisibile);
							bannerHasFinishedLoading = true;
						}
					});
					hasBanner = true;
					Log.d("AdActivity", "Banner Created.");
				}
			}
		});
	}
	
	public void hideBanner() 
	{
		Log.d("AdActivity", "hideBanner");

		runOnUiThread(new Runnable()
		{
			@Override
			public void run() 
			{ 

				if (hasBanner && bannerHasFinishedLoading)
				{
					mAdView.setVisibility(View.GONE);
					Log.d("AdActivity", "Banner Hidden");
				}
				bannerVisibile = false;
			}
		});
	}

	public void showBanner()
	{
		Log.d("AdActivity", "showBanner");

		runOnUiThread(new Runnable()
		{
			@Override
			public void run() 
			{ 

				if (hasBanner && bannerHasFinishedLoading)
				{
					mAdView.loadAd(adRequest);
					mAdView.setVisibility(View.VISIBLE);
					Log.d("AdActivity", "Banner Showing");
				}
				bannerVisibile = true;
			}
		});
	}

	public void requestInterstitial(final String adID) 
	{
		Log.d("AdActivity", "requestInterstitial");

		runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{ 
				mInterstitialAd = new InterstitialAd(mSingleton);
				mInterstitialAd.setAdUnitId(adID);

				AdRequest adRequest = new AdRequest.Builder().build();
				mInterstitialAd.loadAd(adRequest);

				mInterstitialAd.setAdListener(new AdListener()
				{
					@Override
					public void onAdClosed() 
					{
						interstitialDidClose = true;
						Log.d("AdActivity", "onInterstitialClosed");
					}
					
					@Override
					public void onAdLoaded()
					{
						Log.d("AdActivity", "interstitialDidReceive");
						interstitialLoaded = true;
					}
					
					@Override
					public void onAdFailedToLoad(int errorCode) 
					{
						Log.d("AdActivity", "onInterstitialFailedToLoad");
						interstitialDidFailToLoad = true;
					}
					
					@Override
					public void onAdOpened()
					{
						interstitialLoaded = false;
					}

				});

				hasInterstitial = true;
			}
		});
	}
	
	//Called in isInterstitialLoaded
	private void updateInterstitialState()
	{
		runOnUiThread(new Runnable(){
			@Override
			public void run() 
			{

				if (hasInterstitial)
				{
					if (mInterstitialAd.isLoaded()) 
					{
						interstitialLoaded = true;
						Log.d("AdActivity", "Interstitial is loaded: " + interstitialLoaded);
					}
					else
					{
						interstitialLoaded = false;
						Log.d("AdActivity", "Interstitial has not loaded yet. " + interstitialLoaded);
					}
				}
			}
		});
	}
	
	public boolean isInterstitialLoaded()
	{
		Log.d("AdActivity", "isInterstitialLoaded");
		//WORKAROUND: runOnUiThread finishes after the return of this function, then interstitialLoaded could be wrong!
		if (interstitialLoaded)
		{
			updateInterstitialState();
			return true;
		}
		updateInterstitialState();
		return false;
	}
	
	public void showInterstitial() 
	{
		Log.d("AdActivity", "showInterstitial");

		runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{

				if (hasInterstitial)
				{
					if (mInterstitialAd.isLoaded())
					{
						mInterstitialAd.show();
						Log.d("AdActivity", "Ad loaded!, showing...");
					}
					else 
					{
						Log.d("AdActivity", "Ad is NOT loaded!, skipping.");
					}
				}
			}
		});
	}
	
	public void requestRewardedAd(final String adID) 
	{
		Log.d("AdActivity", "requestRewardedAd");
		if (!hasRewardedVideo)
		{
			hasRewardedVideo = true;
		}
		
		runOnUiThread(new Runnable(){
			@Override
			public void run() 
			{
				 mRewardedAd.loadAd(adID, new AdRequest.Builder().build());
			}
		});
		
		
	}
	
	//Called in rewardedAdLoaded
	private void updateRewardedAdState()
	{
		runOnUiThread(new Runnable(){
			@Override
			public void run() 
			{
				
				if (hasRewardedVideo)
				{
					if (mRewardedAd.isLoaded()) 
					{
						Log.d("AdActivity", "Rewarded ad is loaded");
						rewardedAdLoaded = true;
					}
					else
					{
						Log.d("AdActivity", "Rewarded ad has not loaded yet.");
						rewardedAdLoaded = false;
					}
				}
			}
		});
	}
	
	public boolean isRewardedAdLoaded()
	{
		Log.d("AdActivity", "isRewardedAdLoaded");
		if (rewardedAdLoaded)
		{
			updateRewardedAdState();
			return true;
		}
		updateRewardedAdState();
		return false;
	}
	
	
	public void showRewardedAd() 
	{
		Log.d("AdActivity", "showRewardedAd");

		runOnUiThread(new Runnable()
		{
			@Override
			public void run()
			{

				if (hasRewardedVideo)
				{
					if (mRewardedAd.isLoaded())
					{
						mRewardedAd.show();
						Log.d("AdActivity", "RewardedAd loaded!, showing...");
					}
					else 
					{
						Log.d("AdActivity", "RewardedAd is NOT loaded!, skipping.");
					}
				}
			}
		});
	}
	
	
	//For callbacks
	public boolean coreInterstitialClosed()
	{
		if (interstitialDidClose)
		{
			interstitialDidClose = false;
			return true;
		}
		return false;
	}
	
	public boolean coreInterstitialError()
	{
		if (interstitialDidFailToLoad)
		{
			interstitialDidFailToLoad = false;
			return true;
		}
		return false;
	}
	
	public boolean coreRewardedAdDidStop()
	{
		if (rewardedAdDidStop)
		{
			rewardedAdDidStop = false;
			return true;
		}
		return false;
	}
	
	public boolean coreRewardedAdError()
	{
		if (rewardedAdDidFailToLoad)
		{
			rewardedAdDidFailToLoad = false;
			return true;
		}
		return false;
	}
	
	public boolean coreRewardedAdDidFinish()
	{
		if (rewardedAdDidFinish)
		{
			rewardedAdDidFinish = false;
			return true;
		}
		return false;
	}
	
	public String coreGetRewardType()
	{
		return rewardType;
	}
	
	public double coreGetRewardQuantity()
	{
		return rewardQty;
	}
}





