package com.globalphotowall.service;

import com.globalphotowall.model.Counter;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

@Service
public class PhotoIdGeneratorService {

    private static final String COUNTER_ID = "photo_id";
    private static final long INITIAL_SEQUENCE = 100000L;

    private final MongoTemplate mongoTemplate;

    public PhotoIdGeneratorService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public String generateNextPhotoId() {
        Query query = new Query(Criteria.where("_id").is(COUNTER_ID));
        
        if (!mongoTemplate.exists(query, Counter.class)) {
            Counter initialCounter = new Counter(COUNTER_ID, INITIAL_SEQUENCE);
            try {
                mongoTemplate.insert(initialCounter);
            } catch (org.springframework.dao.DuplicateKeyException e) {
                // Ignore if created concurrently by another thread/process
            }
        }

        Update update = new Update().inc("seq", 1);
        FindAndModifyOptions options = FindAndModifyOptions.options()
                .returnNew(true);

        Counter counter = mongoTemplate.findAndModify(query, update, options, Counter.class);

        if (counter == null) {
            throw new IllegalStateException("Failed to generate photo ID");
        }

        return String.format("IMG-%06d", counter.getSeq());
    }
}
