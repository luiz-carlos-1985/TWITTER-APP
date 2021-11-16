package com.tweet.service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.social.twitter.api.HashTagEntity;
import org.springframework.social.twitter.api.Stream;
import org.springframework.social.twitter.api.StreamDeleteEvent;
import org.springframework.social.twitter.api.StreamListener;
import org.springframework.social.twitter.api.StreamWarningEvent;
import org.springframework.social.twitter.api.Tweet;
import org.springframework.social.twitter.api.Twitter;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
public class StreamTweetEventoService {

	private final Logger log = LoggerFactory.getLogger(StreamTweetEventoService.class);

	@Autowired
	private Twitter twitter;
	
	private Stream userStream;

	public void streamTweetEvent(List<SseEmitter> emitters) throws InterruptedException{

    	List<StreamListener> listeners = new ArrayList<StreamListener>();
    	
    	StreamListener streamListener = new StreamListener() {
			@Override
			public void onWarning(StreamWarningEvent warningEvent) {
			}

			@Override
			public void onTweet(Tweet tweet) {
				
				Integer connectedUsers =  emitters.size();
								
				if (connectedUsers!=0) {
                                    emitters.forEach(emiter -> {
                                        try {
                                            emiter.send(SseEmitter.event().name("streamLocation").data(tweet.getUser().getLocation()));
                                            
                                            StringBuilder hashTag = new StringBuilder();
                                            
                                            List<HashTagEntity> hashTags = tweet.getEntities().getHashTags();
                                            hashTags.forEach(hash -> {
                                                hashTag.append("#").append(hash.getText()).append(" ");
                                            });
                                            emiter.send(SseEmitter.event().name("streamHashtags").data(hashTag));
                                        } catch (IOException e) {
                                            System.out.println("Usuário desconectado da Stream");
                                        }
                                    });
				}else{
					//Fecha a stream quando todos os usuários são desconectados.
					userStream.close();
					log.info("Nenhum usuário conectado - Fechando stream");
				}
				
			}

			@Override
			public void onLimit(int numberOfLimitedTweets) {
			}

			@Override
			public void onDelete(StreamDeleteEvent deleteEvent) {
			}
		};
		// começa a stream quando um usuário é conectado.
		if (emitters.size()==1) {
			listeners.add(streamListener);
			userStream = twitter.streamingOperations().sample(listeners);
		}
	
	}
}
