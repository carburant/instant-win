/**
 *
 * Edit and create Sweepstakes [Deprecated]
 *
 * @name Sweepstake
 * @datasource {achievements} Fetches Achievements of type="InstantWin"
 * @template {main} Main template
 * @example <div data-hull-component="instant-admin@hull"></div>
 */
Hull.component({

  templates: ['main'],

  datasources: {
    achievements: function() {
      return this.api('app/achievements', this.signRequest({
        where: { _type: 'InstantWin' }
      }));
    }
  },

  afterRender: function() {
    this.$appSecret = this.$el.find('#hull-app-secret');
    this.$achievementsSelector = this.$el.find('#hull-achievement-id');
    this.$achievementName = this.$el.find('#hull-instant-update-name');
    this.$achievementId = this.$el.find('#hull-instant-update-id');
    this.$achievementDescription = this.$el.find('#hull-instant-update-description');
    this.$achievementSecret = this.$el.find('#hull-instant-update-secret');
    this.$achievementPrizes = this.$el.find('#hull-prizes-json');

    this.showAchievement();
    this.$achievementsSelector.on('change', this.sandbox.util._.bind(this.showAchievement, this));
  },


  showAchievement: function() {
    var self = this, _ = this.sandbox.util._;
    var id = this.$achievementsSelector.val();
    var achievement = this.sandbox.util._.where(this.data.achievements, { id: id })[0];
    if(achievement){
      this.$achievementName.val(achievement.name);
      this.$achievementId.text(achievement.id);
      this.$achievementDescription.val(achievement.description);
      this.$achievementSecret.val(achievement.secret);
      this.api(id + '/prizes', this.signRequest()).then(function(res) {
        var code = {
          prizes: _.map(res || [], function(p) {
            return _.pick(p, 'id', 'name', 'description', 'available_at', 'extra', 'user_id', 'badge_id');
          })
        };
        self.$achievementPrizes.val(JSON.stringify(code, null, 2));
      });
    }
  },

  signRequest: function(data) {
    return this.sandbox.util._.extend(data || {}, {
      access_token: this.appSecret
    });
  },

  actions: {
    create: function(e) {
      e.preventDefault();

      var description = this.$el.find('#hull-instant-description').val();
      var secret = this.$el.find('#hull-instant-secret').val();
      var data = {
        type: 'instant_win',
        name: this.$el.find('#hull-instant-name').val()
      };
      if (description.length) { data.description = description; }
      if (secret.length) { data.secret = secret; }

      this.api('app/achievements', 'post', this.signRequest(data)).then(this.sandbox.util._.bind(function(res) {
        alert('Sweepstake Created');
        this.refresh();
      }, this)).fail(function() {
        alert('Cannot create Sweepstake');
      });
    },

    updateAchievement: function() {
      var id = this.$achievementsSelector.val();

      var description = this.$achievementDescription.val();
      var secret = this.$achievementSecret.val();

      var data = { name: this.$achievementName.val() };
      if (description.length) { data.description = description; }
      if (secret && secret.length) { data.secret = secret; }

      this.api(id, 'put', this.signRequest(data)).then(function() {
        alert('Achievement Updated');
      }, function() {
        alert('Ooops... Check the form...');
      });
    },

    updatePrizes: function() {
      var prizes, _ = this.sandbox.util._;
      try {
        prizes = $.parseJSON(this.$achievementPrizes.val());
      } catch (error) {
        return alert('Invalid JSON');
      }

      _.each(prizes.prizes || [], function (p) {
        delete p.id;
      });
      var id = this.$achievementsSelector.val();
      var self = this;
      this.api.delete(id + '/prizes').then(function () {
        self.api(id + '/prizes', 'put', self.signRequest(prizes)).then(function() {
          self.refresh();
        }, function(err) {
          alert('Ooops... check your JSON...');
          console.error(err);
        });
      });
    },

    sign: function() {
      this.appSecret = this.$appSecret.val();
      this.refresh();
    }
  }
});
