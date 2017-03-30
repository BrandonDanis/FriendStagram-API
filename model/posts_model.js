const config = require('../config')

let env = process.env.NODE_ENV || 'development';
console.log(process.env.NODE_ENV);
console.log(config[env]);

const db = require('pg-bricks').configure(process.env.DB_URL);
const Rx = require('rx');

module.exports.addPosts = (description, url, tags, owner) => {
    return Rx.Observable.create(observer => {
        db.insert('posts', {description, 'image_url': url, 'user_id': owner}).returning('*').row((err, row) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(row);
            observer.onCompleted();
        });
    });
}

module.exports.getPostByID = (id) => {
    return Rx.Observable.create(observer => {
        db.select().from('posts').where(id).row((err, row) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(row);
            observer.onCompleted();
        });
    });
}

// TODO: add sort
module.exports.search = (queryParams) => {
    const {tags, offset = 0, limit = 15, sort, description = ""} = queryParams;

    let findParams = {};
    if(tags)
        findParams.tags = tags;
    if(description)
        findParams.description = {$regex: new RegExp(description, "i")};

    const getPosts = (observer, postIDs) => {
        const hasIDs = postIDs !== undefined;
        const postIDQuery = hasIDs ? ' AND P.id IN $4' : '';
        let params = [`%${description}%`, offset, limit];
        if (hasIDs)
            params.push(postIDs);

        db.raw(`SELECT P.id, P.description, P.image_url, U.id as user_id, U.username FROM POSTS as P, USERS as U WHERE P.USER_ID = U.ID AND P.DESCRIPTION LIKE $1${postIDQuery} ORDER BY P.id DESC OFFSET $2 LIMIT $3`, params).rows((err, rows) => {
            if (err)
                observer.onError(err);
            else
                observer.onNext(rows);
            observer.onCompleted();
        })
    };

    if (tags !== undefined && tags.length > 0) {
        const getTagsObservable = Rx.Observable.create(observer => {
           db.select('pt.post_id').from('post_tags as pt').join('tags t').on('t.id', 'pt.tag_id').where($in('t.name', tags)).rows((err, rows) => {
               if (err)
                   observer.onError(err);
               else
                   observer.onNext(rows);
               observer.onCompleted();
           })
        });
        return getTagsObservable.flatMap(postIDs => {
            return Rx.Observable.create(observer => {
                getPosts(observer, postIDs);
            });
        });
    }

    return Rx.Observable.create(observer => {
        getPosts(observer);
    });
}

module.exports.delete = (id) => {
    return Rx.Observable.create(observer => {
        db.delete().from('posts').where({id}).run(err => {
            if (err)
                observer.onError(err);
            else
                observer.onNext('');
            observer.onCompleted();
        });
    });
}

module.exports.batchDelete = (postsToDelete) => {
    return Rx.Observable.create(observer => {
       db.delete().from('posts').where($in('id', postsToDelete)).run(err => {
           if (err)
               observer.onError(err);
           else
               observer.onNext('');
           observer.onCompleted();
       })
    });
}
